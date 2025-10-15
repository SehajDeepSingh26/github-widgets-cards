import {Card} from './card';
import * as d3 from 'd3';
import moment from 'moment';
import {Theme} from '../const/theme';

export function createDetailCard(
    title: string,
    userDetails: {
        index: number;
        icon: string;
        name: string;
        value: string;
    }[],
    contributionsData: {contributionCount: number; date: Date}[],
    theme: Theme
) {
    const card = new Card(title, 700, 200, theme);
    const svg = card.getSVG();

    // draw icon
    const panel = svg.append('g').attr('transform', `translate(30,30)`);
    const labelHeight = 14;
    panel
        .selectAll(null)
        .data(userDetails)
        .enter()
        .append('g')
        .attr('transform', d => {
            const y = labelHeight * d.index * 2;
            return `translate(0,${y})`;
        })
        .attr('width', labelHeight)
        .attr('height', labelHeight)
        .attr('fill', theme.icon)
        .html(d => d.icon);

    // draw text
    panel
        .selectAll(null)
        .data(userDetails)
        .enter()
        .append('text')
        .text(d => {
            return d.value;
        })
        .attr('x', labelHeight * 1.5)
        .attr('y', d => labelHeight * d.index * 2 + labelHeight)
        .style('fill', theme.text)
        .style('font-size', `${labelHeight}px`);

    // process chart data - switch from monthly to per-date (last 14 days)
    // Build per-day counts for the last N days (inclusive)
    const DAYS = 14;
    const endDate = moment().startOf('day').toDate();
    const startDate = moment(endDate).subtract(DAYS - 1, 'days').toDate();

    // Aggregate contributionsData by date string (YYYY-MM-DD) and limit to range
    const dateCountMap = new Map<string, number>();
    for (const data of contributionsData) {
        const dateStr = moment(data.date).format('YYYY-MM-DD');
        const dateObj = moment(dateStr, 'YYYY-MM-DD').toDate();
        if (dateObj < startDate || dateObj > endDate) continue;
        dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + data.contributionCount);
    }

    // Ensure we have an entry for every day in range (fills zeroes)
    const lineChartData: {contributionCount: number; date: Date}[] = [];
    for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
        const dStr = m.format('YYYY-MM-DD');
        lineChartData.push({
            contributionCount: dateCountMap.get(dStr) || 0,
            date: m.toDate()
        });
    }

    // prepare chart data
    const chartRightMargin = 30;
    const chartWidth = card.width - 2 * card.xPadding - chartRightMargin - 230;
    const chartHeight = card.height - 2 * card.yPadding - 10;
    const x = d3.scaleTime().range([0, chartWidth]);

    // Domain set explicitly to start/end of the last N days
    x.domain([startDate, endDate]);

    // eslint-disable-next-line prefer-spread
    const yMax = Math.max.apply(
        Math,
        lineChartData.map(function (o) {
            return o.contributionCount;
        })
    );

    const y = d3.scaleLinear().range([chartHeight, 0]);
    y.domain([0, yMax]);
    y.nice();

    const valueline = d3
        .area<{contributionCount: number; date: Date}>()
        .x(function (d) {
            return x(d.date);
        })
        .y0(y(0))
        .y1(function (d) {
            return y(d.contributionCount);
        })
        .curve(d3.curveMonotoneX);

    const chartPanel = svg
        .append('g')
        .attr('color', theme.chart)
        .attr('transform', `translate(${card.width - chartWidth - card.xPadding + 5},10)`);

    // draw chart line
    chartPanel
        .append('path')
        .data([lineChartData])
        .attr('transform', `translate(${-chartRightMargin},0)`)
        .attr('stroke', theme.chart)
        .attr('fill', theme.chart)
        .attr('opacity', 1)
        .attr('d', valueline);

    // Add the X Axis
    const xAxis = d3
        .axisBottom<Date>(x)
        .tickFormat(d3.timeFormat('%m-%d'))
        .tickValues(
            // show a tick every 2 days to avoid clutter
            lineChartData.map(d => d.date).filter((_, i) => i % 2 === 0)
        );

    chartPanel
        .append('g')
        .attr('color', theme.text)
        .attr('transform', `translate(${-chartRightMargin},${chartHeight})`)
        .call(xAxis);

    // Add the Y Axis
    chartPanel
        .append('g')
        .attr('color', theme.text)
        .attr('transform', `translate(${chartWidth - chartRightMargin},0)`)
        .call(d3.axisRight(y).ticks(8));

    // hard code this coordinate becuz I'm too lazy
    chartPanel
        .append('g')
        .append('text')
        .text(`contributions in the last ${DAYS} days`)
        .attr('y', title.length > 30 ? 140 : -15) // if the title is too long, then put text to the bottom
        .attr('x', 230)
        .style('fill', theme.text)
        .style('font-size', `10px`);

    return card.toString();
}
