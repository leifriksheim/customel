function getWidth(props) {
  if (props.wide) return 1200;
  if (props.narrow) return 600;
  return 800;
}

export default props => `
  div {
    display: block;
    margin: 0 auto;
    width: 100%;
    max-width: ${getWidth(props)}px;
  }
`;
