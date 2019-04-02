// From https://github.com/PolymerElements/iron-overlay-behavior/blob/2.x/iron-focusables-helper.html

declare namespace Polymer {
    namespace IronFocusablesHelper {
        /**
          * Returns a sorted array of tabbable nodes, including the root node.
          * It searches the tabbable nodes in the light and shadow dom of the chidren,
          * sorting the result by tabindex.
          * @param {!Node} node
          * @return {!Array<!HTMLElement>}
          */
        function getTabbableNodes(node: Node): HTMLElement[];

        /**
          * Returns if a element is focusable.
          * @param {!HTMLElement} element
          * @return {boolean}
          */
        function isFocusable(element: HTMLElement): boolean;

        /**
          * Returns if a element is tabbable. To be tabbable, a element must be
          * focusable, visible, and with a tabindex !== -1.
          * @param {!HTMLElement} element
          * @return {boolean}
          */
        function isTabbable(element: HTMLElement): boolean;
    }
}