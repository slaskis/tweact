declare module "react-tree-walker" {
  interface Options {
    componentWillUnmount: boolean;
  }

  function VisitorFunction(
    element: React.ReactElement<any>,
    instance: React.Component | undefined,
    context: React.Context<any>,
    childContext?: React.Context<any>
  ): boolean | Promise<any>;

  function ReactTreeWalker(
    element: React.ReactElement<any>,
    visitor: VisitorFunction,
    context?: React.Context<any>,
    options?: Options
  ): Promise<void>;

  export default ReactTreeWalker;
}
