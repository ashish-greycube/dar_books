from __future__ import unicode_literals
import frappe, erpnext
import frappe.defaults
from frappe import msgprint, _

@frappe.whitelist()
def get_stock_entry_items(stock_entry):
	doc = frappe.get_doc('Stock Entry', stock_entry)
	res = []
	for d in doc.get('items'):
		res.append({
					"item_code": d.item_code,
					"qty":d.qty
				})
	return res

@frappe.whitelist()
def get_items(warehouse, posting_date, posting_time, company):
	from erpnext.stock.doctype.stock_reconciliation.stock_reconciliation import get_stock_balance
	from erpnext.controllers.queries import get_income_account

	lft, rgt = frappe.db.get_value("Warehouse", warehouse, ["lft", "rgt"])
	items = frappe.db.sql("""
		select i.name, i.item_name, bin.warehouse,i.description,i.stock_uom
		from tabBin bin, tabItem i
		where i.name=bin.item_code and i.disabled=0 and i.is_stock_item = 1
		and i.has_variants = 0 and i.has_serial_no = 0 and i.has_batch_no = 0
		and exists(select name from `tabWarehouse` where lft >= %s and rgt <= %s and name=bin.warehouse)
	""", (lft, rgt))

	items += frappe.db.sql("""
		select i.name, i.item_name, id.default_warehouse,i.description,i.stock_uom
		from tabItem i, `tabItem Default` id
		where i.name = id.parent
			and exists(select name from `tabWarehouse` where lft >= %s and rgt <= %s and name=id.default_warehouse)
			and i.is_stock_item = 1 and i.has_serial_no = 0 and i.has_batch_no = 0
			and i.has_variants = 0 and i.disabled = 0 and id.company=%s
		group by i.name
	""", (lft, rgt, company))

	res = []
	for d in set(items):
		stock_bal = get_stock_balance(d[0], d[2], posting_date, posting_time,
			with_valuation_rate=True)
		income_account = frappe.db.get_value('Company', company, 'default_income_account')
		if frappe.db.get_value("Item", d[0], "disabled") == 0:
			if stock_bal[0] > 0:
				res.append({
					"item_code": d[0],
					"warehouse": d[2],
					"description":d[3],
					"uom":d[4],
					"income_account":income_account,
					"qty": stock_bal[0],
					"item_name": d[1],
					"valuation_rate": stock_bal[1],
					"current_qty": stock_bal[0],
					"current_valuation_rate": stock_bal[1]
				})

	return res