/**
 * @author ldd
 * @license MIT 
 * @link https://github.com/ldd/react-tech-tree/blob/master/LICENSE.md
 * @link https://github.com/ldd/react-tech-tree/blob/master/src/helpers/styleHelper.js
 * 
 */


export const DEFAULT_FRAME = { w: 16, h: 16, x: 0, y: 0 };

const frameStyle = ({ frame } = { frame: DEFAULT_FRAME }) => {
  const { w: width, h: height, x, y } = frame;
  return { width, height, backgroundPosition: `-${x}px -${y}px` };
};

export const prepareSpritesheetStyle = (spriteImage: string, spriteInformation: any) => {
  const defaultFrame = Object.values(spriteInformation.frames)[0];

  return (name: string)=> ({
    backgroundImage: `url(${spriteImage})`,
    ...frameStyle(spriteInformation.frames[name] || defaultFrame)
  });
};