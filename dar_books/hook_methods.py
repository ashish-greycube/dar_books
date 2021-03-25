
from __future__ import unicode_literals
import json
import frappe
from frappe import _
from frappe.desk.page.setup_wizard.setup_wizard import make_records


def after_migrate():
    custom_fields = [
        {
            "doctype": "Custom Field",
            "dt": "User",
            "label": "Default Target Warehouse",
            "fieldname": "default_target_warehouse_cf",
            "fieldtype": "Link",
            "options": "Warehouse",
            "allow_in_quick_entry": 1,
            "translatable": 0,
            "insert_after": "time_zone"
        }
    ]
    for d in custom_fields:
        if not frappe.get_meta(d["dt"]).has_field(d["fieldname"]):
            frappe.get_doc(d).insert()

    # fixtures = [
    #     {
    #         "doctype": "Customer Group",
    #         "customer_group_name": _("Retailer"),
    #         "is_group": 0,
    #         "parent_customer_group": _("All Customer Groups"),
    #     },
    #     {
    #         "doctype": "Customer Group",
    #         "customer_group_name": _("Eye Hospital"),
    #         "is_group": 0,
    #         "parent_customer_group": _("All Customer Groups"),
    #     },
    #     {
    #         "doctype": "Customer Group",
    #         "customer_group_name": _("Optometrist"),
    #         "is_group": 0,
    #         "parent_customer_group": _("All Customer Groups"),
    #     },
    # ]

    # make_records(fixtures)
