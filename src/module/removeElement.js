export function removeElement(element) {
    let parentElement = element.parentNode;
    if(parentElement){
        parentElement.removeChild(element);
    }
}