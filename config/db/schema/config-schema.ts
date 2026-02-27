// export settings table 
/*
id (serial)
site_name: text
description: text
logo: text
dark_logo?: text
favicon: text
google_analytics_id?: text
google_tag_manager_id?: text
google_search_console_id?: text
yandex_analytics_id?: text
bing_analytics_id?: text
posthog_api_key?: text
posthog_base_url?: text
socials: jsonb {url, icon (svg), name}
copyright_text: text
openrouter_api_key: text
openrouter_base_url: text
openrouter_model: text
*/

// navbar
/*
id (serial)
label: text
path: text (/xyz)
order: number
*/

// sidebar
/*
id (serial)
label: text
path: text (/xyz)
order: number
*/

// footer
/*
id (serial)
list_label: string
list_items: jsonb {label, path, order}
*/

// page
/*
id (serial)
slug: text
title: text
content: text
tags: text[]
*/

