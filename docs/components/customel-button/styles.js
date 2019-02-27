export default ({ full, primary }) => `
button {
  display: block;
  ${full ? "width: 100%;" : ""}
  text-align: center;
  border: 0;
  outline: 0;
  cursor: pointer;
  padding: 20px 50px;
  border-radius: 5px;
  ${primary ? primaryStyles() : ""}
};
`;

function primaryStyles() {
  return `
    color: #fff;
    background-color: black;
  `;
}
