# -*- coding: utf-8 -*-
# Copyright (c) 2019, GreyCube Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from erpnext.utilities.product import get_price

class StockReceiveandInvoice(Document):
	def on_submit(self):
		
		# Sales Invoice
		si = frappe.get_doc({
				"doctype": "Sales Invoice",
				"title": self.customer,
				"status": "Draft",
				"comnpany" : self.company,
				"customer" :self.customer,
				"posting_date" :self.posting_date,
				"posting_time": self.posting_time,
				"source_warerhouse" :self.customer_warehouse,
				"price_list" : frappe.db.get_value("Selling Settings", None, "selling_price_list"),
				"cost_center" : self.cost_center,
				"taxes_and_charges" :self.sales_taxes_and_charges_template
				

			})

		for item in self.get('items',{'sold_qty' : '> 0'}): #get rows with sold_qty > 0 for invoice
			si.append("items", { 
				"item_code": item.item,
				"item_name" :item.item,
				"qty" :item.sold_qty,
				"rate" : get_price(item.item,frappe.db.get_value("Selling Settings", None, "selling_price_list"),frappe.get_value("Customer", self.customer, "customer_group"),self.company,item.sold_qty),
				"description": frappe.get_value("Item", item.item, "description"),
				"stock_uom" : frappe.get_value("Item", item.item, "stock_uom")
				
			})
		
			
		# doc.save()
		# si.validate()
		#si.save(ignore_permissions = True)
		si.insert(ignore_permissions = True)
		# si.run_method("set_missing_values")
		
		# Stock Entry
		# se = frappe.get_doc({
		# 		"doctype": "Stock Entry",
		# 		"purpose": "Material Transfer",
		# 		"source_warehouse" : self.customer_warehouse,
		# 		"target_warehouse" : self.agent_warehouse,
		# 		"title": "Material Transfer from " + self.customer,
		# 		"status": "Draft"
		# 	})
		# # se.append(self.items)
		# se.insert()
		# se.save()

	pass
