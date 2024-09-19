import { render, mem, h as f, html, sig } from "./solid_monke/solid_monke.js";
import { get_channel, add_block } from "./arena.js";
import { parseSpendItem, totalSpentDay, totalSpentWeek, createTagFilter, createOrTagFilter, createNotOrTagFilter } from "./utils.js";
import Cal from "./calendar.js"

let food = createOrTagFilter(["food", "grocery"])
// food = createNotOrTagFilter(["food", "grocery", "earnings"])
Cal.applyFilter({
	name: "food",
	filter: food
})

Cal.removeFilter({ name: "food" })

let weektotal = mem(() => totalSpentWeek(Cal.week(), Cal.contents()))

let slug = "log-spending";

get_channel(slug).then((channel) => Cal.data.channel = channel);

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

let modal_date = sig("")

function handleAdd() {
	let price = document.getElementById("price")?.value
	let place = document.getElementById("place")?.value
	let tags = document.getElementById("tags")?.value

	let content = `${price}
	${place}
	[${tags}]`

	add_block(slug, modal_date(), content)
	closeModal()
}


let openModal = (date) => {
	if (date) {
		modal_date.set(date)
		document.querySelector(".modal").style.left = "25%"
	}
}

let closeModal = () => {
	document.querySelector(".modal").style.left = "250%"
}

let AddModal = () => {
	return html`
			button.close [onclick = ${closeModal}] -- x
			.entry
				span -- Price
				div
					input#price
				span -- $

			.entry
				span -- Place
				div
					input#place
				span -- ()

			.entry
				span -- Tags
				div
					input#tags 
				span -- []

			.entry
				span -- ->
				button [onclick = ${handleAdd}] -- Add
				span -- <-
		`
}


let Day = (day) => {
	let items = mem(() => Cal.findDaysBlocks(day))
	let totalSpend = mem(() => totalSpentDay(items()))
	let handleAdd = () => {
		openModal(`${day.date} ${day.month} ${day.year}`)
		console.log("modal date", modal_date())
	}

	return html`
		.day 
			p.date -- ${day.date}, ${day.month} | ${day.day_name}
			each in ${items} as ${SpendItem}
			.total -- ( ${totalSpend} $ )
			button.add [onclick = ${handleAdd}] -- Add`
}

let MonthView = (month) => {
	return html`
	.month
		each in ${month} as ${WeekView}
	`
}

let WeekView = (week) => {
	let total = mem(() => totalSpentWeek(week, Cal.contents()))
	return html`
		.week
			each in ${week} as ${Day}
		.total -- ► ${total} $ ◄`
}

let Main = html`
		.modal -- ${AddModal}
		.week
			each in ${Cal.week} as ${Day}

		.bottom-panel 
			.week-total -- ► Week Total: ${weektotal} $ ◄

			.week-selector
				button [onclick = ${Cal.prevWeek}]  -- Previous
				span.current                        -- ${Cal.current_week}
				button [onclick = ${Cal.nextWeek}]  -- Next`


render(f("div", Main), document.body);
