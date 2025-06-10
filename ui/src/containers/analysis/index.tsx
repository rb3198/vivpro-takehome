import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import * as d3 from "d3";
import { Track } from "../../types/track";

type Props = {
  tracks?: Track[];
};

type NumericTrack = Omit<Track, "id" | "title" | "userRating">;
const PADDING_VERT = 50;
const PADDING_LEFT = 50;
const RADIUS = 5;
const N_HIST_BUCKETS = 5;

export const Analysis: React.FC<Props> = ({ tracks }) => {
  const [activeChart, setActiveChart] = useState<"scatter" | "hist">("scatter");
  const { columnNameMap } = Track;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [xCol, setXCol] = useState<keyof NumericTrack>("acousticness"); // TODO: change to IDX
  const [yCol, setYCol] = useState<keyof NumericTrack>("danceability");
  const scaledTracks = tracks?.map((track) => ({
    ...track,
    duration: Math.floor(track.duration / 1000),
    rating: Math.max(0, track.rating),
  }));

  const getXYScalingFuncs = (
    tracks: Track[],
    chartWidth: number,
    chartHeight: number
  ) => {
    const xRange = [RADIUS + PADDING_LEFT, chartWidth - RADIUS];
    const yRange = [chartHeight - PADDING_VERT, PADDING_VERT];
    let bucketCountMap = new Map<keyof Track, number[]>();
    const bucketCounts: number[] = [];
    for (let i = 0; i < N_HIST_BUCKETS; i++) {
      bucketCounts.push(0);
    }
    bucketCountMap.set(xCol, bucketCounts);
    switch (activeChart) {
      case "hist":
        function customXScale(): d3.ScaleContinuousNumeric<number, number> {
          let domain = [0, 0];
          let range: [number, number] = [0, 0];
          let bucketBounds: number[] = [];
          const scale = (input: number) => {
            const [min, max] = domain;
            bucketBounds = [];
            const xHistCoords: number[] = [];
            const r = range[1] - range[0];
            let offset = range[0];
            for (let i = 0; i <= N_HIST_BUCKETS; i++) {
              bucketBounds.push((i * 1) / N_HIST_BUCKETS);
              const mid =
                ((i * 1) / N_HIST_BUCKETS + (i + 1) / N_HIST_BUCKETS) / 2;
              i < N_HIST_BUCKETS && xHistCoords.push(offset + mid * r);
            }
            const normalizedInput = (input - min) / (max - min);
            const index = bucketBounds.findIndex((x) => x >= normalizedInput);
            return xHistCoords[Math.max(0, index - 1)];
          };

          scale.domain = (d?: [number, number]) => {
            if (d) {
              domain = d;
              return scale;
            }
            return domain;
          };

          scale.range = (r?: [number, number]) => {
            if (r) {
              range = r;
              return scale;
            }
            return range;
          };

          scale.ticks = (_?: number) => {
            return d3.scaleLinear().ticks(100);
          };

          scale.invert = (value: number) => {
            const [min, max] = domain;
            const bucketRange = (max! - min!) / N_HIST_BUCKETS;
            bucketBounds = [];
            for (let i = min!; i <= max!; i += bucketRange) {
              bucketBounds.push(i);
            }
            bucketBounds.push(max);
            const xHistCoords: number[] = [];
            const r = range[1] - range[0];
            let offset = range[0];
            for (let i = 0; i < bucketBounds.length - 1; i++) {
              const mid = (bucketBounds[i] + bucketBounds[i + 1]) / 2;
              const x = offset + (mid * r) / (max - min);
              xHistCoords.push(x);
            }
            const index = bucketBounds.findIndex((x) => x >= value);
            return xHistCoords[index - 1];
          };

          scale.copy = () => {
            return customXScale().domain(domain).range(range);
          };
          // @ts-ignore
          return scale;
        }

        function customYScale(): d3.ScaleContinuousNumeric<number, number> {
          let domain: [number, number] = [0, 0]; // domain to define the range of counts
          let range: [number, number] = [0, 0]; // range to define the pixel space (height of the bars)

          // Define the scale function
          const scale = (input: number): number => {
            const [min, max] = domain;
            const normalizedInput = (input - min) / (max - min);
            const bucketBounds = [];
            for (let i = 0; i <= N_HIST_BUCKETS; i++) {
              bucketBounds.push((i * 1) / N_HIST_BUCKETS);
            }
            const index = bucketBounds.findIndex((x) => x >= normalizedInput);
            const bucketCounts = bucketCountMap.get(xCol);
            if (!bucketCounts) {
              return 0;
            }
            // const r = range[0] - range[1];
            return (
              yRange[0] -
              RADIUS * 2 * (++bucketCounts[Math.max(0, index - 1)] - 1)
            );
          };

          // Define the domain method
          scale.domain = (d?: [number, number]) => {
            if (d) {
              domain = d;
              return scale;
            }
            return domain;
          };

          // Define the range method
          scale.range = (r?: [number, number]) => {
            if (r) {
              range = r;
              return scale;
            }
            return range;
          };

          // Define the ticks method
          scale.ticks = (_?: number) => {
            const bucket = bucketCountMap.get(yCol);
            if (!bucket) {
              return [0];
            }
            const maxCount = Math.max(...bucket);
            return new Array(maxCount).fill(0).map((_, idx) => idx);
          };

          // Define the invert method (to go from height back to count)
          scale.invert = (value: number): number => {
            const [min, max] = domain;
            const r = range[1] - range[0];
            return min + ((range[1] - value) / r) * (max - min);
          };

          scale.copy = () => {
            return customYScale().domain(domain).range(range);
          };

          return scale as d3.ScaleContinuousNumeric<number, number>;
        }

        return {
          x: customXScale()
            .domain([
              d3.min(tracks, (d) => d[xCol])!,
              d3.max(tracks, (d) => d[xCol])!,
            ])
            .range(xRange),
          y: customYScale()
            .domain([
              d3.min(tracks, (d) => d[xCol])!,
              d3.max(tracks, (d) => d[xCol])!,
            ])
            .range(yRange),
        };
      case "scatter":
      default:
        const x = d3
          .scaleLinear()
          .domain([
            d3.min(tracks, (d) => d[xCol])!,
            d3.max(tracks, (d) => d[xCol])!,
          ])
          .range(xRange);
        const y = d3
          .scaleLinear()
          .domain([
            d3.min(tracks, (d) => d[yCol])!,
            d3.max(tracks, (d) => d[yCol])!,
          ])
          .range(yRange);
        return {
          x,
          y,
        };
    }
  };

  const renderXTicks = (xAxis: HTMLDivElement | null) => {
    if (!scaledTracks || !scaledTracks.length || !xAxis) {
      return;
    }
    const prevTicks = document.querySelectorAll("." + styles.x_ticks);
    prevTicks.forEach((tick) => {
      tick.parentNode?.removeChild(tick);
    });
    const { width } = xAxis.getBoundingClientRect();
    const maxX = Math.max(...scaledTracks.map((track) => track[xCol]));
    const r = maxX;
    const nPoints = activeChart === "scatter" ? 12 : N_HIST_BUCKETS + 1;
    const ticks: { pos: number; value: number }[] = [];
    for (let i = 0; i < nPoints; i++) {
      const normalized = i / (nPoints - 1);
      ticks.push({
        pos: width * normalized,
        value: r * normalized,
      });
    }
    for (let i = 0; i < ticks.length; i++) {
      const tick = document.createElement("div");
      const valueNode = document.createElement("p");
      valueNode.innerText =
        ticks[i].value % 1 === 0
          ? ticks[i].value.toString()
          : ticks[i].value.toFixed(2);
      tick.appendChild(valueNode);
      tick.setAttribute("style", `left: ${ticks[i].pos}px`);
      tick.classList.add(styles.x_ticks);
      xAxis.appendChild(tick);
    }
  };

  const renderYTicks = (yAxis: HTMLDivElement | null) => {
    if (!scaledTracks || !scaledTracks.length || !yAxis) {
      return;
    }
    const prevTicks = document.querySelectorAll("." + styles.y_ticks);
    prevTicks.forEach((tick) => {
      tick.parentNode?.removeChild(tick);
    });
    const { height } = yAxis.getBoundingClientRect();
    const minY =
      activeChart === "hist"
        ? 0
        : Math.min(...scaledTracks.map((track) => track[yCol]));
    const maxY =
      activeChart === "hist"
        ? scaledTracks.length
        : Math.max(...scaledTracks.map((track) => track[yCol]));
    const r = maxY - minY;
    const nPoints = activeChart === "scatter" ? 12 : 20;
    const ticks: { pos: number; value: number }[] = [];
    for (let i = 1; i <= nPoints; i++) {
      const normalized = i / nPoints;
      ticks.push({
        pos: height * (1 - normalized),
        value: r * normalized,
      });
    }
    for (let i = 0; i < ticks.length; i++) {
      const tick = document.createElement("div");
      const valueNode = document.createElement("p");
      valueNode.innerText =
        ticks[i].value % 1 === 0
          ? ticks[i].value.toString()
          : ticks[i].value.toFixed(2);
      tick.appendChild(valueNode);
      tick.setAttribute("style", `top: ${ticks[i].pos}px`);
      tick.classList.add(styles.y_ticks);
      yAxis.appendChild(tick);
    }
  };

  const renderAxes = () => {
    return (
      <>
        <div id={styles.x_axis} ref={(ref) => renderXTicks(ref)}>
          <label>{columnNameMap[xCol]}</label>
        </div>
        <div id={styles.y_axis} ref={(ref) => renderYTicks(ref)}></div>
        <label id={styles.y_label}>
          {activeChart === "scatter" ? columnNameMap[yCol] : "# of Tracks"}
        </label>
      </>
    );
  };

  const renderPlot = (
    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  ) => {
    if (!scaledTracks || !scaledTracks.length || !chartContainerRef.current) {
      return;
    }
    const { width: chartWidth, height: chartHeight } =
      chartContainerRef.current.getBoundingClientRect();
    const t = d3.transition().duration(1000);
    const { x, y } = getXYScalingFuncs(scaledTracks, chartWidth, chartHeight);
    const tooltip = d3.select("." + styles.tooltip);
    svg
      .selectAll("circle")
      .data(scaledTracks)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => x(d[xCol]))
            .attr("cy", (d) => y(d[activeChart === "scatter" ? yCol : xCol]))
            .call((enter) => enter.transition(t).attr("r", RADIUS)),
        (update) =>
          update
            .transition(t)
            .delay((_, i) => i * RADIUS)
            .attr("cx", (d) => x(d[xCol]))
            .attr("cy", (d) => y(d[activeChart === "scatter" ? yCol : xCol]))
            .call((update) => update.transition().attr("r", RADIUS)),
        (exit) => exit.remove()
      )
      .on("mouseover", (event, d) => {
        tooltip
          .style("top", event.pageY + "px")
          .style("left", event.pageX + 10 + "px");
        tooltip.style("display", "block");
        tooltip.html(
          `<p> <span>Title:</span> ${d["title"]} <br> <span>${columnNameMap[xCol]}:</span> ${d[xCol]}</p>`
        );
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  };

  useLayoutEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    const { height, width } = chartContainerRef.current.getBoundingClientRect();
    const svg = d3.select("#" + styles.chart_container);
    if (svg.select("svg").empty()) {
      svg.append("svg").attr("width", width).attr("height", height);
    }

    // d3.select("#" + styles.chart_container + " > svg").remove();
    renderPlot(svg.select("svg"));
  }, [xCol, yCol, activeChart, scaledTracks]);

  const renderChartTypeMenu = () => {
    return (
      <ul id={styles.chart_menu}>
        <li
          data-active={activeChart === "scatter"}
          onClick={() => setActiveChart("scatter")}
        >
          Scatterplot
        </li>
        <li
          data-active={activeChart === "hist"}
          onClick={() => setActiveChart("hist")}
        >
          Histogram
        </li>
      </ul>
    );
  };

  const onXChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setXCol(e.target.value as keyof NumericTrack);
  };

  const onYChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setYCol(e.target.value as keyof NumericTrack);
  };

  const renderChartAxesMenu = () => {
    if (!scaledTracks || !scaledTracks.length) {
      return null;
    }
    const [track] = scaledTracks;
    const numericKeys = Object.keys(track).filter(
      (key) =>
        typeof track[key as keyof Track] === "number" && key !== "userRating"
    );
    return (
      <div id={styles.chart_axes_menu}>
        <div>
          <label>X:</label>
          <select defaultValue={xCol} onChange={onXChange}>
            {numericKeys.map((key) => (
              <option key={key} value={key}>
                {columnNameMap[key as keyof NumericTrack]}
              </option>
            ))}
          </select>
        </div>
        {(activeChart === "scatter" && (
          <div>
            <label>Y:</label>
            <select defaultValue={yCol} onChange={onYChange}>
              {numericKeys.map((key) => (
                <option key={key} value={key}>
                  {columnNameMap[key as keyof NumericTrack]}
                </option>
              ))}
            </select>
          </div>
        )) || <></>}
      </div>
    );
  };

  const renderChart = () => {
    if (!scaledTracks || !scaledTracks.length) {
      return;
    }
    return (
      <div id={styles.chart_container} ref={chartContainerRef}>
        {renderAxes()}
      </div>
    );
  };
  return (
    <div id={styles.container}>
      {renderChartTypeMenu()}
      {renderChartAxesMenu()}
      {renderChart()}
      <div className={styles.tooltip}></div>
    </div>
  );
};
