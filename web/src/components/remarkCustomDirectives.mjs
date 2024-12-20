import { visit } from "unist-util-visit";

export const remarkCustomDirectives = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "containerDirective") {
        const data = node.data || (node.data = {});
        data.hName = node.name;

        switch (node.name) {
          case "cannabisLocationAlert":
          case "note":
            data.hProperties = { header: node.attributes.header };
            break;
          case "callout":
            data.hProperties = {
              headerText:
                node.attributes.headerText && node.attributes.headerText.length > 0
                  ? node.attributes.headerText
                  : undefined,
              showHeader: node.attributes.showHeader === "true",
              showIcon: node.attributes.showIcon === "true",
              calloutType: node.attributes.calloutType,
            };
            break;
          case "icon":
            data.hProperties = { type: node.attributes.type };
            break;
        }
      }
    });
  };
};
