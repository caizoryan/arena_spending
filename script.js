import { render, sig, mem, h as f, mut, html } from "./solid_monke/solid_monke.js";
import { generate_year } from "./generate_year.js";
import { get_channel } from "./arena.js";
import { find_blocks, parseSpendItem, total } from "./utils.js";

let current_week = sig(35)
let data = mut({ channel: {}, year: generate_year(2024) })
let week = mem(() => data.year[current_week()]);
let contents = mem(() => data.channel.contents);



let next = () =>
	data.year.length > current_week() + 1
		? current_week.set(current_week() + 1)
		: current_week.set(0)

let prev = () =>
	current_week() > 0
		? current_week.set(current_week() - 1)
		: current_week.set(data.year.length - 1)


get_channel("log-spending").then((channel) => data.channel = channel);


// ******************************
// COMPONENTS
// ******************************
//
let SpendItem = (block) => {
	let item = parseSpendItem(block)
	return html`
		.spend-item
			.price -- ${item.price} $
			.title -- ${item.title}`
}


let Day = (day) => {
	let blocks = mem(() => find_blocks(day, contents()))
	let totalSpend = mem(() => total(blocks()))

	return html`
		.day 
			p.date -- ${day.date}, ${day.month} | ${day.day_name}
			each ${blocks} as ${SpendItem}
			.total -- ( ${totalSpend} $ )
`
}

let Week = () => {
	let t = mem(() => {
		let v = 0
		v = week().reduce((acc, day) => acc += (total(find_blocks(day, contents()))), 0)
		return v.toFixed(2)
	})

	return html`
	.week
		each ${week} as ${Day}
	.bottom-panel
		.week-total -- ► Week Total: ${t} $ ◄
		div -- ${WeekSelector}`
}

let WeekSelector = () => {

	return html`
		.week-selector
			button [onclick = ${prev}] -- Previous
			span.current -- ${current_week}
			button [onclick = ${next}] -- Next`
}

render(f("div", Week), document.body);
