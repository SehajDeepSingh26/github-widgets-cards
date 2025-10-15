import {Card} from './card';
import {Icon} from '../const/icon';
import {Theme} from '../const/theme';

export function createStatsCard(
    title: string,
    statsData: {index: number; icon: string; name: string; value: string}[],
    theme: Theme
) {
    const card = new Card(title, 540, 220, theme);
    const svg = card.getSVG();

    const leftPadding = 30;
    const topPadding = 24;
    const labelHeight = 18;
    const lineSpacingMultiplier = 1.6;

    const panel = svg.append('g').attr('transform', `translate(${leftPadding},${topPadding})`);
    panel
        .selectAll(null)
        .data(statsData)
        .enter()
        .append('g')
        .attr('transform', d => {
            const y = labelHeight * d.index * lineSpacingMultiplier;
            return `translate(0,${y})`;
        })
        .attr('width', labelHeight)
        .attr('height', labelHeight)
        .attr('fill', theme.icon)
        .html(d => d.icon);

    panel
        .selectAll(null)
        .data(statsData)
        .enter()
        .append('text')
        .text(d => {
            return `${d.name}`;
        })
        .attr('x', labelHeight * 1.6)
        .attr('y', d => labelHeight * d.index * lineSpacingMultiplier + labelHeight)
        .style('fill', theme.text)
        .style('font-size', `${labelHeight}px`);

    panel
        .selectAll(null)
        .data(statsData)
        .enter()
        .append('text')
        .text(d => {
            return `${d.value}`;
        })
        .attr('x', 200) 
        .attr('y', d => labelHeight * d.index * lineSpacingMultiplier + labelHeight)
        .style('fill', theme.text)
        .style('font-size', `${labelHeight}px`);

    const panelForGitHubLogo = svg.append('g').attr('transform', `translate(390,${topPadding})`);
    panelForGitHubLogo.append('g').attr('transform', `scale(6)`).style('fill', theme.icon).html(Icon.GITHUB);

    return card.toString();
}
