import { render, mem, h as f, html, sig, eff_on } from "./solid_monke/solid_monke.js";
import { get_channel, add_block } from "./arena.js";
import { parseSpendItem, totalSpentDay, totalSpentWeek, createTagFilter, createOrTagFilter, createNotOrTagFilter } from "./utils.js";
import Cal from "./calendar.js"

let food = createOrTagFilter(["food"])

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
	console.log("item", item)


	return html`
		.spend-item
			.price -- ${item.price} $
			.title -- ${item.title}
		`
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

let show_spending_wrapped = sig(true)

function group_by_place(arr) {
	if (!arr || arr.lenght > 0) return {}
	let places = {}
	arr.forEach((a) => {
		let item = parseSpendItem(a)
		if (places[item?.title]) {
			let old_price = places[item.title].price
			let new_price = parseFloat(old_price) + parseFloat(parseSpendItem(a).price)
			places[item.title] = { price: new_price, title: parseSpendItem(a).title }
		} else { places[item?.title] = parseSpendItem(a) }
	})
	return places
}

let SpendingWrapped = () => {

	let highest = (arr) => {
		let places = group_by_place(arr)

		if (Object.keys(places).length == 0) return undefined
		let high_item = Object.entries(places).reduce((a, b) => a[1]?.price > b[1]?.price ? a : b)

		return { title: high_item[1].title, price: high_item[1].price }
	}

	let c = Cal.contents

	let _food = mem(() => {
		let items = [...c()]
		let filtered = items.filter(food)
		return filtered
	})

	let food_highest = mem(() => {
		if (!_food()) return undefined
		if (!Array.isArray(_food())) return undefined

		let filtered = _food()
		let high = highest(filtered)
		return high
	})

	let rank_sorted = arr => {
		let places = group_by_place(arr)
		let sorted = Object.entries(places).sort((a, b) => b[1]?.price - a[1]?.price)
		return sorted
	}

	let food_sorted_by_price = mem(() => {
		if (!_food()) return []
		if (!Array.isArray(_food())) return []

		let items = [..._food()]
		let filtered = items
		let ranked = rank_sorted(filtered).flat()

		return ranked
	})

	let food_price = mem(() => food_highest()?.price)
	let food_place = mem(() => food_highest()?.title)

	let title_price = (e) => html`div -- ${e?.title} ${e?.price}`

	return html`
		.spend-wrapped [active = ${show_spending_wrapped}]
			each in ${food_sorted_by_price} as ${title_price}
			div -- Your fav place to food is ${food_place} with ${food_price} $ spent
`
}

let Main = html`
		.modal -- ${AddModal}
		.week
			each in ${Cal.week} as ${Day}
		div -- ${_ => SpendingWrapped}

		.bottom-panel 
			.week-total -- ► Week Total: ${weektotal} $ ◄

			.week-selector
				button [onclick = ${Cal.prevWeek}]  -- Previous
				span.current                        -- ${Cal.current_week}
				button [onclick = ${Cal.nextWeek}]  -- Next`


document.addEventListener("keydown", (e) => {
	if (e.key == "c") {
		show_spending_wrapped.set(!show_spending_wrapped())

	}
})

render(f("div", Main), document.body);
