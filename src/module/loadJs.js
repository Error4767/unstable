export function loadJs(load_address) {
	var Head_Node = document.getElementsByTagName('HEAD').item(0);
	var New_Script= document.createElement("script");
	New_Script.type = "text/javascript";
	New_Script.src = load_address ;
	Head_Node.appendChild(New_Script);
}