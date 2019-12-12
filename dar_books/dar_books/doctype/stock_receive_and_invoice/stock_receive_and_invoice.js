// Copyright (c) 2019, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Stock Receive and Invoice', {
	fetch_customer_warehouse_items(frm){
		frappe.call({
			method:"dar_books.api.get_items",
			args: {
				warehouse: frm.doc.customer_warehouse,
				posting_date: frm.doc.posting_date,
				posting_time: frm.doc.posting_time,
				company:frm.doc.company
			},
			callback: function(r) {
				console.log(r)
				var items = [];
				frm.clear_table("items");
				for(var i=0; i< r.message.length; i++) {
					var d = frm.add_child("items",
					{item:r.message[i].item_code, customer_qty:r.message[i].current_qty, left_qty :0 , sold_qty:0});
					$.extend(d, r.message[i]);
                }
                frm.refresh_field("items");
			}
	
		});
	},
	
})

frappe.ui.form.on('Stock Receive and Invoice Items', 
	"left_qty", function(frm, cdt, cdn) { // notice the presence of cdt and cdn
    // that means that child doctype and child docname are passed to function and hence you can know what 
   // row was modified and triggered
    var item = locals[cdt][cdn]; // this is where the magic happens
    // locals is a global array that contains all the local documents opened by the user
    // item is the row that the user is working with
    // to what you need to do and update it back
    var sold_qty = item.customer_qty - item.left_qty ;
    item.sold_qty = sold_qty; // remember to refresh the field to see the changes in the UI'
	
});