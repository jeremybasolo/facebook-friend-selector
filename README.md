# Facebook Friend Selector

## ! This is DEPRECATED as of recent changes in the API, Facebook no longer authorize to get the full list of a user's friends !

**Demo:** https://jeremybasolo.com/demos/fbfriendselector/index.html

Tested on:
Firefox, Chrome, Safari, IE7, IE8, IE9


A sample source code is available in index.html


The parameters available are listed below:

- friendsByPage: any positive integer. Define the number of friends to display by page. If value is 0, no pagination. Default value is 0.
- displayThumbnail: true or false. Display or not the thumbnail for each friend. Default value is true.
- loadingText: any HTML. Define the HTML to display while the content is Loading. Default value is 'Loading...'.
- searchEngine: true or false. Add a search engine at the top. Default value is true.
- onSelect: Javascript function. Define the function to execute when the user click on a friend. a Json object can be use in that function, containing the id and name of the friend. 
Default value is:
function(data) {
  	var display = 'Id: ' + data.id + '\n\nName: ' + data.name;
	console.log(display);
}
