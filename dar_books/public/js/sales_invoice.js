frappe.ui.form.on('Sales Invoice', {
	fetch_items_from_warehouse_book(frm){
		frappe.call({
			method:"dar_books.api.get_items",
			args: {
				warehouse: frm.doc.set_warehouse,
				posting_date: frm.doc.posting_date,
				posting_time: frm.doc.posting_time,
				company:frm.doc.company
			},
			callback: function(r) {
				console.log(r)
				var items = [];
				frm.clear_table("items");
				for(var i=0; i< r.message.length; i++) {
					var d = frm.add_child("items");
					$.extend(d, r.message[i]);
					if(!d.qty) d.qty = null;
					if(!d.valuation_rate) d.valuation_rate = null;
				}
				frm.refresh_field("items");
				frm.set_value('selling_price_list', undefined)
				frm.set_value('selling_price_list', 'Selling')
				frm.refresh_field("items");
			}
		});
	},
})