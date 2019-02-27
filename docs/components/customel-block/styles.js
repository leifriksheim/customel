import { margin, padding, flex } from "../../utils/styles.js";

export default props => `
  .my-block {
    background-color: ${props.backgroundColor};
    text-align: ${props.textAlign};
    ${padding(props)}
    ${margin(props)}
    ${flex(props)}
  }
`;
