declare var unwrap: <TNode extends Node>(node: TNode) => TNode;

interface Node {
    /**
    * Appends the WebComponent to this component.
    */
    appendChild<TWebComponent extends Vidyano.WebComponents.WebComponent>(component: TWebComponent): TWebComponent;

    /**
    * Appends the Node to this component.
    */
    appendChild<TNode extends Node>(node: TNode): TNode;
}