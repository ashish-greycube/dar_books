// Copyright (c) 2019, GreyCube Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Stock Receive and Invoice', { 
	onload(frm)
	{
	// alert("on load");
	// on form load set posting_time as now
	if(frm.docstatus = 0)
	{
	frm.set_value("posting_time",frappe.datetime.now_time());
	}	
	},
	validate(frm)
		{
		if(frm.docstatus = 0)
		{
		// to check if there is single sales invoice then sales fields are manadatory
		//alert("validate ");
		var sales_exist = false;
		$.each(frm.doc.items || [], function(i, d) {
			
				if(d.sold_qty > 0 ) 
				{
					//alert("sales_item_exist");
						//check if sales invoice will be created 
						sales_exist =true;
						return false;
					}
					else
					{
						//nothing
					}
					
			  });
			  		frm.set_df_property("sales_taxes_and_charges_template","reqd",true);
					frm.set_df_property("cost_center","reqd",true);
					if(frm.sales_taxes_and_charges_template && frm.cost_center)
					{
						// frappe.validated=true;
						return true;
					}
					{
						// frappe.validated=false;
						frm.refresh_field("cost_center");
						frm.refresh_field("sales_taxes_and_charges_template");
						return false;

					}

		}
		},
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
					//console.log(r)
					var items = [];
					frm.clear_table("items");
					for(var i=0; i< r.message.length; i++) {
						var d = frm.add_child("items",
						{item:r.message[i].item_code, customer_qty:r.message[i].current_qty, left_qty :0 , sold_qty:r.message[i].current_qty});
						$.extend(d, r.message[i]);
					}
					frm.refresh_field("items");
				}
		
			});
		}
	});


frappe.ui.form.on('Stock Receive and Invoice Items',
    "left_qty", function(frm, cdt, cdn) { // notice the presence of cdt and cdn
    // that means that child doctype and child docname are passed to function and hence you can know what 
   // row was modified and triggered
    var item = locals[cdt][cdn]; // this is where the magic happens
    // locals is a global array that contains all the local documents opened by the user
    // item is the row that the user is working with
    // to what you need to do and update it back
    var sold_qty = item.customer_qty - item.left_qty ;
    if (sold_qty < 0)
    {
        alert("Left Quantity " + item.left_qty.toString() + " cannot be more than initial Customer Qty "+ item.customer_qty.toString() +" for Item : " + item.item_code);
        item.left_qty = item.customer_qty;
        item.sold_qty = 0;
    }
    else
    {
    item.sold_qty = sold_qty; // remember to refresh the field to see the changes in the UI'
    }
    frm.refresh_field("items");
    }
);
