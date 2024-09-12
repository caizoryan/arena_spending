import { sig, mem, mut } from "./solid_monke/solid_monke.js";
import { generate_year } from "./generate_year.js";

let current_week = sig(36)
let data = mut({ channel: {}, year: generate_year(2024) })
let week = mem(() => data.year[current_week()]);

let findDaysBlocks = (day) => data.channel?.contents?.filter((block) => {
  let title = block.title;
  let [d, m, y] = title.split(" ");
  return d == day.date && m == day.month && y == day.year;
});

let contents = mem(() => data.channel.contents);

let nextWeek = () =>
  data.year.length > current_week() + 1
    ? current_week.set(current_week() + 1)
    : current_week.set(0)

let prevWeek = () =>
  current_week() > 0
    ? current_week.set(current_week() - 1)
    : current_week.set(data.year.length - 1)


export default {
  nextWeek,
  prevWeek,
  week,
  contents,
  findDaysBlocks,
  data,
  current_week,
}
