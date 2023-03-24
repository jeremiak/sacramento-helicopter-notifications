# Sacramento helicopter notifcations

A machine readable dataset scraped from the [Sacramento helipcopter notifications page](https://www.cityofsacramento.org/Police/News-Alerts/Helicopter-Notifications).

[![Scrape helicopter notifcations](https://github.com/jeremiak/sacramento-helicopter-notifications/actions/workflows/scrape.yml/badge.svg)](https://github.com/jeremiak/sacramento-helicopter-notifications/actions/workflows/scrape.yml)

## Running

```
deno run --allow-read=notifications.json --allow-write=notifications.json --allow-net ./scrape.ts
```
