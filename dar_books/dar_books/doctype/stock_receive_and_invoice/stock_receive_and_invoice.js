// Copyright (c) 2019, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Stock Receive and Invoice', {
	onload(frm) {
		// alert("on load");
		// on form load set posting_time as now
		if (frm.docstatus = 0) {
			frm.set_value("posting_time", frappe.datetime.now_time());
		}
	
		if (frm.doc.target_warehouse==undefined || frm.doc.target_warehouse=='')
		frappe.db.get_value('User', frappe.user, 'default_target_warehouse_cf')
		.then(r => {
			if (r.message.default_target_warehouse_cf){
				frm.set_value('target_warehouse', r.message.default_target_warehouse_cf)
			}
		})	
		frm.set_query('stock_transfer_entry', () => {
			return {
				filters: {
					stock_entry_type: 'Material Transfer',
					to_warehouse:frm.doc.target_warehouse
				}
			}
		})				
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
		if (frm.docstatus == 0) {
			var sold_qty_more_than_zero = false;
			$.each(frm.doc.items || [], function (i, d) {
				if (d.sold_qty > 0) {
					sold_qty_more_than_zero=true
				} else {
					//nothing
				}
			});
			if (sold_qty_more_than_zero == false) {
				frm.set_df_property("sales_taxes_and_charges_template", "reqd", false);
				frm.set_df_property("cost_center", "reqd", false);	
			} else {
				frm.set_df_property("sales_taxes_and_charges_template", "reqd", true);
				frm.set_df_property("cost_center", "reqd", true);
			}
		}
	},
	customer_warehouse(frm) {
		if(frm.doc.fetch_option=='All' && frm.doc.customer_warehouse){
			frm.trigger('fetch_customer_warehouse_items')

		}		
	},
	fetch_option(frm) {
		if(frm.doc.fetch_option=='All' && frm.doc.customer_warehouse){
			frm.trigger('fetch_customer_warehouse_items')

		}
		else if(frm.doc.fetch_option=='Specific Stock Entry' && frm.doc.stock_transfer_entry){
			frm.trigger('fetch_stock_entry_items')
		}
	},
	stock_transfer_entry(frm) {
		if(frm.doc.fetch_option=='Specific Stock Entry' && frm.doc.stock_transfer_entry){
			frm.trigger('fetch_stock_entry_items')
		}		
	},
	fetch_stock_entry_items(frm) {
		frappe.call({
			method: "dar_books.api.get_stock_entry_items",
			args: {
				stock_entry: frm.doc.stock_transfer_entry
			},
			callback: function (r) {
				console.log(r.message)
				var items = [];
				frm.clear_table("items");
				for (var i = 0; i < r.message.length; i++) {
					var d = frm.add_child("items", {
						item: r.message[i].item_code,
						customer_qty: r.message[i].qty,
						left_qty: 0,
						sold_qty: r.message[i].qty
					});
					$.extend(d, r.message[i]);
				}
				frm.refresh_field("items");
			}

		});
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
	scan_barcode_book: function (frm) {
		let scan_barcode_field = frm.fields_dict["scan_barcode_book"];

		let show_description = function (idx, exist = null, scanned_value = null) {
			if (exist) {
				scan_barcode_field.set_new_description(__('Row #{0}: Qty increased by 1', [idx]));
			}
			//doesn't exist in items table
			else if (idx == 0 && exist == null) {
				scan_barcode_field.set_new_description(__("Scaned Barcode {0} doesn't exist in below items table.", [scanned_value]));
			}
			//doesn't exist
			else if (idx == -1 && exist == null) {
				scan_barcode_field.set_new_description(__('Cannot find Item with barcode {0}', [scanned_value]));
			}
		}

		if (frm.doc.scan_barcode_book) {
			frappe.call({
				method: "erpnext.selling.page.point_of_sale.point_of_sale.search_serial_or_batch_or_barcode_number",
				args: {
					search_value: frm.doc.scan_barcode_book
				}
			}).then(r => {
				const data = r && r.message;
				if (!data || Object.keys(data).length === 0) {
					scan_barcode_field.set_value('');
					show_description(-1, null, scan_barcode_field.value)
					return false;
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
				if (row_to_modify == blank_item_row) {
					// scanned item not in child table
					scan_barcode_field.set_value('');
					show_description(0, null, scan_barcode_field.value);
					return false
				}
				show_description(row_to_modify.idx, row_to_modify.item);
				frm.from_barcode = true;
				var idx = row_to_modify.idx - 1
				frappe.model.set_value(row_to_modify.doctype, row_to_modify.name, 'left_qty', (row_to_modify.left_qty || 0) + 1)
				scan_barcode_field.set_value('');
				return true;
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