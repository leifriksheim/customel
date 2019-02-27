import { margin, padding, flex } from "../../utils/styles.js";

export function carouselStyles(props) {
  return `
  div {
    display: flex;
    scroll-snap-type: x mandatory;
    overflow-x: scroll;
    width: 100%;
    margin: 0 auto;
  }
`;
}

export function carouselItemStyles(props) {
  return `
  div {
    scroll-snap-align: center;
  }
`;
}
