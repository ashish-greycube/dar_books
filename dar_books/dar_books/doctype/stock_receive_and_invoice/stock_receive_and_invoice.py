# -*- coding: utf-8 -*-
# Copyright (c) 2019, GreyCube Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from erpnext.utilities.product import get_price
from frappe.model.mapper import get_mapped_doc

class StockReceiveandInvoice(Document):
	def on_submit(self):
		print(self.docstatus,'-------')
		stockentry=self.make_stock_entry(source_name=self.name)
		doclist=self.make_sales_invoice(source_name=self.name)


	def make_sales_invoice(self,source_name, target_doc=None, ignore_permissions=True):

		def set_missing_values(source, target):
			target.update_stock=1
			target.set_warehouse=source.customer_warehouse
			target.taxes_and_charges=source.sales_taxes_and_charges_template
			target.flags.ignore_permissions = ignore_permissions
			target.cost_center =source.cost_center
			target.run_method("set_missing_values")
			target.run_method("calculate_taxes_and_totals")

		def update_item(source, target, source_parent):
			target.item_code=source.item
			target.qty=source.sold_qty
		doclist = get_mapped_doc("Stock Receive and Invoice", source_name, {
				"Stock Receive and Invoice": {
					"doctype": "Sales Invoice",
					"validation": {
						"docstatus": ["=", 1]
					}
				},
				"Stock Receive and Invoice Items": {
					"doctype": "Sales Invoice Item",
					"postprocess": update_item,
					"condition": lambda doc: (doc.sold_qty>0)
				},
				"Sales Taxes and Charges": {
					"doctype": "Sales Taxes and Charges",
					"add_if_empty": True
				},				
			}, target_doc, set_missing_values, ignore_permissions=ignore_permissions)
		doclist.flags.ignore_mandatory = True
		doclist.save(ignore_permissions=True)
		return doclist			

	def make_stock_entry(self,source_name, target_doc=None, ignore_permissions=True):
		def set_missing_values(source, target):
			target.purpose='Material Transfer'
			target.from_warehouse=source.customer_warehouse
			target.to_warehouse=source.target_warehouse
			target.flags.ignore_permissions = ignore_permissions
			target.run_method("set_missing_values")
		def update_item(source, target, source_parent):
			target.item_code=source.item
			target.qty=source.left_qty
		doclist = get_mapped_doc("Stock Receive and Invoice", source_name, {
				"Stock Receive and Invoice": {
					"doctype": "Stock Entry",
					"validation": {
						"docstatus": ["=", 1]
					}
				},
				"Stock Receive and Invoice Items": {
					"doctype": "Stock Entry Detail",
					"postprocess": update_item,
					"condition": lambda doc: (doc.left_qty>0)
				},
			}, target_doc, set_missing_values, ignore_permissions=ignore_permissions)
		doclist.flags.ignore_mandatory = True
		doclist.save(ignore_permissions=True)
		return doclist		