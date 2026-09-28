import { uid } from "@/lib/utils";
import {
  DEFAULT_STYLE,
  type Axis,
  type RadarSnapshot,
  type Series,
} from "./types";

function makeAxes(labels: string[]): Axis[] {
  return labels.map((label) => ({ id: uid("ax"), label }));
}

function makeSeries(
  name: string,
  color: string,
  values: number[],
  fillOpacity = 0.22,
): Series {
  return {
    id: uid("sr"),
    name,
    color,
    fillOpacity,
    values,
    visible: true,
  };
}

export type Preset = {
  id: string;
  name: string;
  hint: string;
  build: () => Pick<RadarSnapshot, "axes" | "series">;
};

export const PRESETS: Preset[] = [
  {
    id: "ability",
    name: "能力模型",
    hint: "个人六维画像",
    build: () => {
      const axes = makeAxes([
        "创造力",
        "执行力",
        "沟通协作",
        "学习成长",
        "领导力",
        "抗压韧性",
      ]);
      return {
        axes,
        series: [
          makeSeries("当前", "var(--chart-1)", [82, 74, 68, 88, 61, 77]),
        ],
      };
    },
  },
  {
    id: "product",
    name: "产品体检",
    hint: "体验与品质",
    build: () => {
      const axes = makeAxes([
        "易用性",
        "性能",
        "视觉",
        "稳定",
        "创新",
        "性价比",
      ]);
      return {
        axes,
        series: [
          makeSeries("本品", "var(--chart-1)", [86, 71, 90, 78, 64, 73]),
          makeSeries("竞品", "var(--chart-2)", [72, 84, 66, 81, 58, 80], 0.16),
        ],
      };
    },
  },
  {
    id: "team",
    name: "团队雷达",
    hint: "职能覆盖",
    build: () => {
      const axes = makeAxes(["工程", "产品", "设计", "增长", "销售", "文化"]);
      return {
        axes,
        series: [
          makeSeries("现状", "var(--chart-1)", [80, 62, 71, 54, 48, 76]),
          makeSeries("目标", "var(--chart-3)", [88, 80, 82, 75, 70, 85], 0.12),
        ],
      };
    },
  },
  {
    id: "body",
    name: "身心状态",
    hint: "训练与恢复",
    build: () => {
      const axes = makeAxes(["力量", "耐力", "柔韧", "专注", "睡眠", "情绪"]);
      return {
        axes,
        series: [
          makeSeries("本周", "var(--chart-1)", [70, 64, 58, 73, 51, 66]),
        ],
      };
    },
  },
  {
    id: "character",
    name: "角色属性",
    hint: "攻防六维",
    build: () => {
      const axes = makeAxes(["攻击", "防御", "速度", "智力", "幸运", "体力"]);
      return {
        axes,
        series: [
          makeSeries("角色 A", "var(--chart-1)", [88, 54, 76, 62, 41, 70]),
          makeSeries("角色 B", "var(--chart-4)", [61, 82, 48, 79, 55, 86], 0.16),
        ],
      };
    },
  },
  {
    id: "blank",
    name: "空白六维",
    hint: "从 50 开始",
    build: () => {
      const axes = makeAxes(["维度一", "维度二", "维度三", "维度四", "维度五", "维度六"]);
      return {
        axes,
        series: [makeSeries("系列 A", "var(--chart-1)", [50, 50, 50, 50, 50, 50])],
      };
    },
  },
];

export function defaultSnapshot(): RadarSnapshot {
  const built = PRESETS[0]!.build();
  return {
    axes: built.axes,
    series: built.series,
    style: { ...DEFAULT_STYLE },
    theme: "dark",
    activeSeriesId: built.series[0]!.id,
  };
}
