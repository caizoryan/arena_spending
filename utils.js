
// ******************************
// UTILS
// ******************************
//

/**
 * Finds the blocks of a specific day
 * @param {Object} day
 * @returns {Array} blocks
 * */
let find_blocks = (day, blocks) => blocks
  ?.filter((block) => {
    let title = block.title;
    let [d, m, y] = title.split(" ");
    return d == day.date && m == day.month && y == day.year;
  });

/**
 * @typedef {Object} SpendItem
 * @property {string} price
 * @property {string} title
 * @property {string} tags
 *
 * @param {Object} block
 * @returns {SpendItem}
 */
let parseSpendItem = (block) => {
  let earnings = false
  let [price, title, tags] = block.content.split(`\n`);
  if (price.charAt(0) == "+") earnings = true
  return { price, title, tags, earnings }
}

function ignoreEarnings(str) {
  return str.charAt(0) == "+" ? "0" : str
}

/**
 * @param {string} str
 */
function subtractEarnings(str) {
  return str.charAt(0) == "+" ? str.replace("+", "-") : str
}

/**
 * Takes blocks with spend item text structure and returns the total of them
 *
 * @param {Array} items
 * @returns {number} total
 **/
let totalSpentDay = (items) => {
  if (!items || items.length == 0) return 0

  let spent = items
    ?.reduce(
      (acc, item) => acc + parseFloat(subtractEarnings(parseSpendItem(item).price)), 0)

  return parseFloat(spent.toFixed(2))
}


const totalSpentWeek = (week, contents) => {
  return week.reduce((acc, day) => acc += totalSpentDay(find_blocks(day, contents)), 0).toFixed(2)
}


export { find_blocks, parseSpendItem, totalSpentDay, totalSpentWeek }
