export function parseURL(url) {
	let urlParams = url.substring(1).split("&");
	let result = {};
	for (let p of urlParams) {
		const [key, value] = p.split("=");
		result[key] = value;
	}
	return result;
}

export function request(url) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url, false);
	Http.send();
	return JSON.parse(Http.responseText);
}

export const template =
	`  <!-- 活动日历 -->
	<div class="calendar-wapper">
	<div class="m-events-calendar">
	  <div class="m-events-calendar" v-if="evetData.length">
		<div class="m-events-calenda__m-right">
		  <!-- 背景虚线 -->
		  <div class="m-events-calendar__line-container">
			<div
			  class="m-events-calendar__line-item"
			  v-for="(item, index) in tableHeaderData"
			  :key="index"
			  :class="{
				'm-events-calendar__line-item-current': item.isToday,
				'm-events-calendar__line-item-last':
				index === tableHeaderData.length
			  }"
			></div>
		  </div>
  
		  <!-- 表头 -->
		  <div class="m-events-calendar__table-header">
			<div
			  class="m-events-calendar__table-header-item"
			  v-for="(item, index) in tableHeaderData"
			  :key="index"
			  :class="{ 'm-events-calendar__table-header-current': item.isToday }"
			>
			  <div class="m-events-calendar__table-header-week">
				{{ item.weekName }}
			  </div>
			  <div class="m-events-calendar__table-header-date">
				{{ item.date }}
			  </div>
			</div>
		  </div>
  
		  <!-- 活动事件 -->
		  <div
			class="m-events-calendar__event-item-container"
			v-for="(item, index) in evetData"
			:key="index"
			@click="goEventLink(item.link)"
			:style="{
			  width: \`\${ item.weekDay * 76 + 12}px\`,
			  '-webkit-transform': \`translate(\${ item.startIndex * 76 }px)\`,
			  transform: \`translate(\${ item.startIndex * 76 }px)\`
			}"
		  >
			<div
			  class="m-events-calendar__event-item-bg"
			  :style="{ backgroundImage: \`url(\${ item.img })\` }"
			></div>
			<div
			  class="m-events-calendar__event-item-tag"
			  :style="{ backgroundColor: item.color }"
			></div>
			<div
			  class="m-events-calendar__event-item"
			  :class="{
				'm-events-calendar__event-item-not-finish': !item.isLastWeek
			  }"
			>
			  <div class="m-events-calendar__event-item-info">
				<span
				  class="m-events-calendar__event-item-act-name"
				  :title="item.eventName">
				  {{ item.abbreviation }}
				</span>
				<!-- 格式一：开始结束日期为不同的日期 -->
				<div
				  class="m-events-calendar__event-item-text"
				  v-if="item.formatTypes === 1">
				  {{ timeHandle(item.startDate) }} ~ {{ timeHandle(item.endDate) }}
				</div>
  
			  <!-- 格式二：开始结束日期为同一个 -->
			  <div
				class="m-events-calendar__event-item-time"
				v-if="item.formatTypes === 2"
			  >
				{{ item.startTime }}开始
			  </div>
			  <!-- 格式三：当天为结束日期 -->
			  <div
				class="m-events-calendar__event-item-time"
				v-if="item.formatTypes === 3"
			  >
				{{ item.endTime }}结束
			  </div>
			</div>
			<!-- 结束时间：天数等于1，切有结束时间 -->
			<div
			  class="m-events-calendar__event-item-end-time"
			  v-if="item.weekDay > 1 && item.endTime && item.isLastWeek"
			>
			  {{ item.endTime }}结束
			</div>
		  </div>
		</div>
		</div>
	  </div>
	</div>
</div>`;
