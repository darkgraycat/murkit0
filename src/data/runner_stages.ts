export type StageConfig = {
  name: string,
  length: number,
  bgrows: BgRow[],
  bgwidth: number,
  bgfill: number,
  fgfill: number,
};
export type BgRow = {
  layout: number[],
  colors: number[]
  offset: number,
  speed: number,
};

// 0xfff5ca75

export default [
  {
    name: "MorningCity", bgwidth: 10, length: 2000,
    bgfill: 0xfff5ca75, fgfill: 0xff002200,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xffe5aa45, 0xffeac770] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xffd59a55, 0xffb57a35] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 2.5, speed: 2.0, colors: [0xff556622, 0x00000000, 0x00000000] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 3.0, speed: 3.0, colors: [0xff445522, 0x00000000, 0x00000000] },
      { layout: [3,3,3,3,3,3,3,3,3,3], offset: 3.5, speed: 3.5, colors: [0xff33312e, 0x00000000, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff222120, 0xff303030, 0x00000000] },
    ],
  },
  {
    name: "SunsetCity", bgwidth: 10, length: 3000,
    bgfill: 0xff4499fd, fgfill: 0xff202122,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff3366ee, 0xff2244aa] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff113388, 0xff2255bb] },
      { layout: [2,2,2,2,2,2,2,2,2,2], offset: 2.5, speed: 2.0, colors: [0xff40424b, 0x00000000, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.0, speed: 3.0, colors: [0xff303236, 0xff206090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.5, speed: 3.5, colors: [0xff28292b, 0xff206090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff202122, 0xff206090, 0x00000000] },
    ],
  },
  {
    name: "NightCity", bgwidth: 10, length: 5000,
    bgfill: 0xff361d20, fgfill: 0xff2b1b1b,
    bgrows: [
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff402026, 0xff6a3e4f] },
      { layout: [0,0,0,0,0,0,0,0,0,0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff683b46, 0xff321e1e] },
      { layout: [4,4,5,4,4,4,5,4,3,3], offset: 2.5, speed: 2.0, colors: [0xff2b1b1b, 0x00000000, 0x00000000] },
      { layout: [5,5,4,4,4,4,5,4,4,4], offset: 3.0, speed: 3.0, colors: [0xff2d1f1e, 0xff304090, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 3.5, speed: 3.5, colors: [0xff302422, 0xff5060a0, 0x00000000] },
      { layout: [5,5,5,5,5,5,5,5,5,5], offset: 4.0, speed: 4.0, colors: [0xff362824, 0xff80a0f0, 0x00000000] },
    ],
  }
] as StageConfig[];
