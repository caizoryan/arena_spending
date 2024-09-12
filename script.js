import { render, mem, h as f, html } from "./solid_monke/solid_monke.js";
import { get_channel } from "./arena.js";
import { parseSpendItem, totalSpentDay, totalSpentWeek } from "./utils.js";
import Cal from "./calendar.js"

let weektotal = mem(() => totalSpentWeek(Cal.week(), Cal.contents()))
get_channel("log-spending").then((channel) => Cal.data.channel = channel);

// ******************************
// COMPONENTS
// ******************************
//
let SpendItem = (block) => {
	let item = parseSpendItem(block)
	let e = () => item.earnings
	let e_ = () => !item.earnings
	return html`
		.spend-item
			.price -- ${item.price} $
			when ${e} then ${_ => html`.price -- ${item.title}`}
			when ${e_} then ${_ => html`.title -- ${item.title}`}`


}

let Day = (day) => {
	let items = mem(() => Cal.findDaysBlocks(day))
	let totalSpend = mem(() => totalSpentDay(items()))

	return html`
		.day 
			p.date -- ${day.date}, ${day.month} | ${day.day_name}
			each in ${items} as ${SpendItem}
			.total -- ( ${totalSpend} $ )`
}

let Main = html`
		.week
			each in ${Cal.week} as ${Day}

		.bottom-panel 
			.week-total -- ► Week Total: ${weektotal} $ ◄

			.week-selector
				button [onclick = ${Cal.prevWeek}]      -- Previous
				span.current                            -- ${Cal.current_week}
				button [onclick = ${Cal.nextWeek}]      -- Next`

render(f("div", Main), document.body);
