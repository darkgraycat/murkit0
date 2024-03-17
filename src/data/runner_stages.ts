import { StageConfig } from "../stage";

export default [
  {
    name: "MorningCity", bgwidth: 10, length: 2000,
    bgfill: 0xfff0c070, fgfill: 0xff002200,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xffe0b040, 0xffeac770] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xffd09050, 0xffb07030] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 2.5, speed: 2.0, colors: [0xff506020, 0x00000000, 0x00000000] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 3.0, speed: 3.0, colors: [0xff405020, 0x00000000, 0x00000000] },
      { layout: [3,3,3,3,3,3,3,3,3,3], offset: 3.5, speed: 3.5, colors: [0xff303020, 0x00000000, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff202020, 0xff303030, 0x00000000] },
    ],
  },
  {
    name: "SunsetCity", bgwidth: 10, length: 3000,
    bgfill: 0xff4090f0, fgfill: 0xff202020,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff3060e0, 0xff2244aa] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff103080, 0xff2255bb] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 2.5, speed: 2.0, colors: [0xff404040, 0x00000000, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.0, speed: 3.0, colors: [0xff303030, 0xff206090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.5, speed: 3.5, colors: [0xff202020, 0xff206090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff202020, 0xff206090, 0x00000000] },
    ],
  },
  {
    name: "NightCity", bgwidth: 10, length: 5000,
    bgfill: 0xff301020, fgfill: 0xff302020,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff402020, 0xff6a3e4f] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff603040, 0xff321e1e] },
      { layout: [4,4,5,4,4,4,5,4,3,3], offset: 2.5, speed: 2.0, colors: [0xff302020, 0x00000000, 0x00000000] },
      { layout: [5,5,4,4,4,4,5,4,4,4], offset: 3.0, speed: 3.0, colors: [0xff201010, 0xff304090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.5, speed: 3.5, colors: [0xff302020, 0xff5060a0, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff302020, 0xff80a0f0, 0x00000000] },
    ],
  }
] as StageConfig[];
