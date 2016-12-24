$(function () { 
	var iconSelected='';
	$('#jstree_demo_div').jstree({ 'core' : {
    'data' : [       
	 { "id" : "ajson1", "parent" : "#", "text" : "Krueger " },
		{ "id" : "ajson2", "parent" : "#", "text" : "Ruskin" },
			{ "id" : "ajson3", "parent" : "ajson2", "text" : "Control Dampers" },
				{ "id" : "ajson4", "parent" : "ajson3", "text" : "Commercial" },
					{ "id" : "ajson5", "parent" : "ajson4", "text" : "CD35","icon" : "/assets/images/CD35.png" },
	 ]
} 
});

$('#jstree_demo_div').on("dblclick.jstree", function (e, data) { 
//alert("node_id: " + data.node.id); 
var tree = $(this).jstree(); var node = tree.get_node(e.target); 
var nodePath = tree.get_path(node);
iconSelected='';
/*if(node.text=="CD35")*/
if(node.icon.match("png$"))  { 
$('#largeImg').attr("src",node.icon).show();
iconSelected=node.icon;
 $('#stext').val(node.text); 
}
});

$('#closeModal').on('click',function(){
		$('#jstree_demo_div').jstree('close_all') ;
		$('#largeImg').removeAttr("src").hide();
		});
 //submit values
	$('#submit').on('click',function(){
		$('#jstree_demo_div').jstree('close_all') ;
		$('#largeImg').removeAttr("src").hide();
		$('#myModal').modal('hide');
		});
//cancel
 $('#cancelBtn').click(function (e) {
        e.preventDefault();
		$('#jstree_demo_div').jstree('close_all') ;
		$('#largeImg').removeAttr("src").hide();
		$('#myModal').modal('hide');
		});
}); 	

function showInput() {
        document.getElementById('CD35-1').innerHTML = document.getElementById("stext").value;
		document.getElementById('jTitle').innerHTML = 
		document.getElementById("inputJobTitle").value;
		document.getElementById('jDescription').innerHTML = 
        document.getElementById("inputJobDescription").value;
		 $('input[type=text]').val('');  
	/* 	document.form.reset(); */
}
 
 /* function clearText (){
	 document.form.reset();
	 
 } */

 function reset(){
    $('input[type=text]').val('');  
   }
	