// deno-lint-ignore-file no-explicit-any

import _ from "npm:lodash@4.17";
import dayjs from "npm:dayjs";
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

async function scrapeHelicopterNotifications(date: string): Promise<Notification[]> {
  console.log(
    `Scraping helicopter notifications`,
  );
  const url = `https://widgets.cityofsacramento.org/HelicopterActivity?date=${date}`
  const response = await fetch(url);
  const status: number = response.status;
  const html = await response.text();
  const document: HTMLDocument | null = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  if (status !== 200) throw new Error(`Error with ${url} - ${status}`);
  const rows = document?.querySelectorAll('table.latestActivity tbody tr')
  const notifications: Notification[] = []
  
  rows.forEach((node: Element, i) => {
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
    `Found ${notifications.length} notifications on ${date}`,
  );

  return notifications;
}
const existingFile = await Deno.readTextFile("./notifications.json");
const existing = JSON.parse(existingFile);
const combined = [...existing]
const daysWorth = 5
console.log(`Scraping for the last ${daysWorth} days`)

for (let i = 0; i < daysWorth; i++) {
  const today = dayjs().subtract(i, 'day').format('YYYYMMDD')
  const scraped: Notification[] = await scrapeHelicopterNotifications(today);

  combined.push(...scraped)
}

const deduped = _.uniqBy(combined, (d: Notification) => `${d.date}-${d.time}-${d.beat}`)
const sorted = _.orderBy(deduped, ["date", "time", "beat"]);

console.log(`Saving to a file`);

await Deno.writeTextFile("./notifications.json", JSON.stringify(sorted, null, 2));
console.log(`All done`);
