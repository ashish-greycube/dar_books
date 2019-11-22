# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "dar_books"
app_title = "Dar Books"
app_publisher = "GreyCube Technologies"
app_description = "Customization for DAR Books Distribution"
app_icon = "octicon octicon-book"
app_color = "blue"
app_email = "admin@greycube.in"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/dar_books/css/dar_books.css"
# app_include_js = "/assets/dar_books/js/dar_books.js"

# include js, css files in header of web template
# web_include_css = "/assets/dar_books/css/dar_books.css"
# web_include_js = "/assets/dar_books/js/dar_books.js"

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {"Sales Invoice" : "public/js/sales_invoice.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "dar_books.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "dar_books.install.before_install"
# after_install = "dar_books.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "dar_books.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"dar_books.tasks.all"
# 	],
# 	"daily": [
# 		"dar_books.tasks.daily"
# 	],
# 	"hourly": [
# 		"dar_books.tasks.hourly"
# 	],
# 	"weekly": [
# 		"dar_books.tasks.weekly"
# 	]
# 	"monthly": [
# 		"dar_books.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "dar_books.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "dar_books.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "dar_books.task.get_dashboard_data"
# }

