// Copyright (c) 2019, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Stock Receive and Invoice', {
	onload(frm) {
		// alert("on load");
		// on form load set posting_time as now
		if (frm.docstatus = 0) {
			frm.set_value("posting_time", frappe.datetime.now_time());
		}
	},
	refresh(frm) {
		let scan_barcode_field = frm.get_field('scan_barcode_book');
		if (scan_barcode_field) {
			scan_barcode_field.set_value("");
			scan_barcode_field.set_new_description("");

			if (frappe.is_mobile()) {
				if (scan_barcode_field.$input_wrapper.find('.input-group').length) return;

				let $input_group = $('<div class="input-group">');
				scan_barcode_field.$input_wrapper.find('.control-input').append($input_group);
				$input_group.append(scan_barcode_field.$input);
				$(`<span class="input-group-btn" style="vertical-align: top">
						<button class="btn btn-default border" type="button">
							<i class="fa fa-camera text-muted"></i>
						</button>
					</span>`)
					.on('click', '.btn', () => {
						frappe.barcode.scan_barcode().then(barcode => {
							scan_barcode_field.set_value(barcode);
						});
					})
					.appendTo($input_group);
			}
		}
	},
	validate(frm) {
		if (frm.docstatus = 0) {
			// to check if there is single sales invoice then sales fields are manadatory
			//alert("validate ");
			var sales_exist = false;
			$.each(frm.doc.items || [], function (i, d) {

				if (d.sold_qty > 0) {
					//alert("sales_item_exist");
					//check if sales invoice will be created 
					sales_exist = true;
					return false;
				} else {
					//nothing
				}

			});
			frm.set_df_property("sales_taxes_and_charges_template", "reqd", true);
			frm.set_df_property("cost_center", "reqd", true);
			if (frm.sales_taxes_and_charges_template && frm.cost_center) {
				// frappe.validated=true;
				return true;
			} {
				// frappe.validated=false;
				frm.refresh_field("cost_center");
				frm.refresh_field("sales_taxes_and_charges_template");
				return false;

			}

		}
	},
	fetch_customer_warehouse_items(frm) {
		frappe.call({
			method: "dar_books.api.get_items",
			args: {
				warehouse: frm.doc.customer_warehouse,
				posting_date: frm.doc.posting_date,
				posting_time: frm.doc.posting_time,
				company: frm.doc.company
			},
			callback: function (r) {
				//console.log(r)
				var items = [];
				frm.clear_table("items");
				for (var i = 0; i < r.message.length; i++) {
					var d = frm.add_child("items", {
						item: r.message[i].item_code,
						customer_qty: r.message[i].current_qty,
						left_qty: 0,
						sold_qty: r.message[i].current_qty
					});
					$.extend(d, r.message[i]);
				}
				frm.refresh_field("items");
			}

		});
	},
	scan_barcode_book: function(frm) {
		let scan_barcode_field = frm.fields_dict["scan_barcode_book"];

		let show_description = function(idx, exist = null) {
			if (exist) {
				scan_barcode_field.set_new_description(__('Row #{0}: is focused', [idx]));
			} else {
				scan_barcode_field.set_new_description(__(''));
			}
		}

		if(frm.doc.scan_barcode_book) {
			frappe.call({
				method: "erpnext.selling.page.point_of_sale.point_of_sale.search_serial_or_batch_or_barcode_number",
				args: { search_value: frm.doc.scan_barcode_book }
			}).then(r => {
				const data = r && r.message;
				if (!data || Object.keys(data).length === 0) {
					scan_barcode_field.set_new_description(__('Cannot find Item with this barcode'));
					return;
				}

				let cur_grid = frm.fields_dict.items.grid;

				let row_to_modify = null;
				const existing_item_row = frm.doc.items.find(d => d.item === data.item_code);
				const blank_item_row = frm.doc.items.find(d => !d.item_code);

				if (existing_item_row) {
					row_to_modify = existing_item_row;
				} else if (blank_item_row) {
					row_to_modify = blank_item_row;
				}

				if (row_to_modify==blank_item_row) {
					// add new row
					scan_barcode_field.set_value('');
					show_description(0,null);
					frappe.msgprint(__("Scaned Barcode") + ": " +scan_barcode_field.value+__(" doesn't exist in items table.") );
					return false

				}

				show_description(row_to_modify.idx, row_to_modify.item);

				frm.from_barcode = true;
				var idx=row_to_modify.idx-1
				frm.fields_dict["items"].grid.grid_rows[idx].activate();
				frm.fields_dict["items"].grid.grid_rows[idx].get_field("left_qty").set_focus();				
				scan_barcode_field.set_value('');
			});
		}
		return false;
	}

});


frappe.ui.form.on('Stock Receive and Invoice Items',
	"left_qty",
	function (frm, cdt, cdn) { // notice the presence of cdt and cdn
		// that means that child doctype and child docname are passed to function and hence you can know what 
		// row was modified and triggered
		var item = locals[cdt][cdn]; // this is where the magic happens
		// locals is a global array that contains all the local documents opened by the user
		// item is the row that the user is working with
		// to what you need to do and update it back
		var sold_qty = item.customer_qty - item.left_qty;
		if (sold_qty < 0) {
			alert("Left Quantity " + item.left_qty.toString() + " cannot be more than initial Customer Qty " + item.customer_qty.toString() + " for Item : " + item.item_code);
			item.left_qty = item.customer_qty;
			item.sold_qty = 0;
		} else {
			item.sold_qty = sold_qty; // remember to refresh the field to see the changes in the UI'
		}
		frm.refresh_field("items");
	}
);