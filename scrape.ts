// deno-lint-ignore-file no-explicit-any

import _ from "npm:lodash@4.17";
import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

interface Notification {
  date: string | undefined;
  time: string | undefined;
  neighborhood: string | undefined;
  beat: string | undefined;
  comments: string;
}

async function scrapeHelicopterNotifications(): Promise<Notification[]> {
  console.log(
    `Scraping helicopter notifications`,
  );
  const url = `https://www.cityofsacramento.org/Police/News-Alerts/Helicopter-Notifications`;
  const response = await fetch(url);
  const status: number = response.status;
  const html = await response.text();
  const doc: HTMLDocument | null = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  if (status !== 200) throw new Error(`Error with ${url} - ${status}`);

  const todayEl = doc?.querySelector('#corporate_content_0_corporate_content_body_1_todayInfo')
  const date = todayEl.innerText.split('Today ')[1]
  const rows = doc?.querySelectorAll('table.latestActivity tbody tr')

  const notifications: Notification[] = []
  
  rows.forEach((node, i) => {
    if (i === 0) return

    const time = node.querySelector('.iActDate').innerText.trim()
    const neighborhood = node.querySelector('.iNeighborhood').innerText.trim()
    const beat = node.querySelector('.iZone').innerText.trim()
    const comments = node.querySelector('.iComments').innerText.trim()

    notifications.push({
      date,
      time,
      neighborhood,
      beat,
      comments,
    })
  })

  console.log(
    `Found ${notifications.length} notifications`,
  );

  return notifications;
}

const scraped: Notification[] = await scrapeHelicopterNotifications();
const existingFile = await Deno.readTextFile("./notifications.json");
const existing = JSON.parse(existingFile);
const combined = [...existing, ...scraped]
const deduped = _.uniqBy(combined, (d: Notification) => `${d.date}-${d.time}-${d.beat}`)
const sorted = _.orderBy(deduped, ["date", "time", "beat"]);

console.log(`Saving to a file`);
await Deno.writeTextFile("./notifications.json", JSON.stringify(sorted, null, 2));
console.log(`All done`);
