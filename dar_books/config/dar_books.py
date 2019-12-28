# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _


def get_data():
            config =  [
                {
                    "label": _("Documents"),
                    "items": [
                    
                        {
                            "type": "doctype",
                            "name": "Stock Receive and Invoice",
                            "label": _("Stock Receive and Invoice"),
                        },
                        {
                            "type": "doctype",
                            "name": "Sales Invoice",
                            "label": _("Sales Invoice"),
                        },
                        {
                            "type": "doctype",
                            "name": "Stock Entry",
                            "label": _("Stock Entry"),
                        }
                        
                    ]
                }
            ]
            return config