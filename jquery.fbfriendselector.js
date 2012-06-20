/* Facebook Friend Selector */
(function($) {
  	  	
	$.fn.fbfriendselector = function(options) {
		
		var opts = $.extend({}, $.fn.fbfriendselector.defaults, options);
	
    	return this.each(function() {
    	
    		// the slected element to add the options
    		var container = $(this);
    		
    		// see if we are logged into facebook
			FB.getLoginStatus(function(response) {
			
				// if we are logged in go to the selector
 				if(response.status === 'connected') {
			   		displaySelector(response.authResponse.accessToken);
			   		
			   	// if we are not logged in add a login with facebook link
 			 	} else {
 			 		container.html("<a class='facebookLogin' href=''>Login with facebook</a>");
 			 		$('.facebookLogin').click(function() {

 			 			// ask for permissions to access friends
 			 			FB.login(function(response) {
  							if (response.authResponse) {
  								
  								// once logged in show the friend selector
  								displaySelector(response.authResponse.accessToken);
  							}
  						});
 						return false;
					});
			 	}
 			});
			
			// function displaying the friend selector
			function displaySelector() {
				
				// add the loading text to the element
				container.html(opts.loadingText);
				
				var output = "";
				
				// query facebook for the users friends
				FB.api('/me/friends', function(response) {
					
					var friends = new Array();
					
				 	for(var i=0, l= response.data.length ; i<l; i++){
					    friends[i] = response.data[i].name + "{--}" + response.data[i].id;
					}
					
					friends.sort();
					
					var friendsName = new Array();
					
					for(var i=0, l= friends.length ; i<l; i++){
					    var friend = friends[i].split("{--}");
					    friends[i] = new Object();
					    friends[i].name = friend[0];
					    friends[i].id = friend[1];
					    friendsName[i] = friends[i].name;
					}
					
					var nbFriends = friends.length;
					
					// set the friends per page according to the options
					if(opts.friendsByPage > 0 && opts.friendsByPage < friends.length) {
					    var nbPages = Math.ceil(friends.length / opts.friendsByPage);
						nbFriends = opts.friendsByPage;
					}
					
					var ulFriends = "<ul class='fbFriends'>";
					for(var i=0, l= nbFriends ; i<l; i++){
 						ulFriends = ulFriends + displayFriend(friends[i]);
					}
					ulFriends = ulFriends + "</ul>";
					output = output + ulFriends;
					// add the pagination if we have more friends
				    if(opts.friendsByPage > 0 && opts.friendsByPage < friends.length) {
				    	var pagination = "<nav class='pagination'><ul>";
				    		// create a link for each page of friends
					    	for (var i=0, l= nbPages ; i<l; i++){
					    		numPage = i+1;
					    		pagination = pagination + "<li><a href='javascript:void(0);' ";
					    		if(numPage == 1) {
					    			pagination = pagination + "class='current'";
					    		}
					    		pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
					    	}
				    	pagination = pagination + "</ul></nav>";
				    	// add pagination to the output
						output = output + pagination;
					}
					
					if(opts.searchEngine == true) {
						var searchEngine = "<input type='text' class='searchEngine' value='Search your friends...'>";
						output = searchEngine + output;
					}
					
					container.html(output);
					
					// adding focus and blur functions for search input
					$('.searchEngine').focus(function() {
						if($(this).val() == 'Search your friends...') {
							$(this).val('');
						}
					}).blur(function() {
						if($(this).val() == '') {
							$(this).val('Search your friends...');
						}
					});
					
					// adding auto complete function for the search input
					$('.searchEngine').keyup(function(e) {
																	
						$('.pagination').remove();
						$('ul.fbFriends', container).remove();
						
						if($(this).val().length > 0) {
							
							var searchResults = searchStringInArray(friendsName, $(this).val());
							var ulFriends = "<ul class='fbFriends'>";
							for(var x = 0 ; x < searchResults.length ; x = x + 1) {
								ulFriends = ulFriends + displayFriend(friends[searchResults[x]]);								
							}
							ulFriends = ulFriends + "</ul>";
							container.append(ulFriends);
							
							// if they have clicked afriend
				    		$('.fbFriends li a', container).click(function() {
				    			friendLinkClick($(this));
							});
							
						} else {
							
							container.append(displayInit(nbFriends, nbPages, friends));
							// if they have clicked afriend
				    		$('.fbFriends li a', container).click(function() {
				    			friendLinkClick($(this));
							});
							// friends pagination click function
						    $(".pagination ul li a").click(function() {
						    	paginationLinkClick(friends, $(this));
						    });
								
						}
					});
					
					// friends pagination click function
				    $(".pagination ul li a").click(function() {
				    	paginationLinkClick(friends, $(this));
				    });
				    
				    // add the pagination click action
				    var paginationLinkClick = function(friends, elem) {
				    	// update the current class
				    	$(".pagination ul li a").removeClass('current');
				    	elem.addClass('current');
				    	
				    	// grab the albums jumping for the relevant page
				        var numPage = elem.html();
				        var start = opts.friendsByPage * (numPage - 1);
				        var ulFriends = "";
				        for (var i=start, l=(start + opts.friendsByPage)  ; i<l; i++){
				        	var friend = friends[i];
				        	if(friend !== undefined) {
				        		ulFriends = ulFriends + displayFriend(friend);
				        	}
				        }
				        
				        // udate the ul with the list items
				        $('ul.fbFriends',container).html(ulFriends);
				        
				        // if they have clicked afriend
				    	$('.fbFriends li a', container).click(function() {
				    		friendLinkClick($(this));
						});
				    }
					
					// add the friend clicked action
				    var friendLinkClick = function(elem) {
				        var data = {
				            'id' : elem.data('id'),
				            'name' : elem.data('name')
				        }
				        opts.onSelect(data);
				    }
				    
				    // set up the friend click event
				    $('.fbFriends li a', container).click(function(){
				        friendLinkClick($(this));
				    });
					
					return false;
					    
				});
			}
			// End of displaySelector()
			
			
			// function to display a li friend item 
			function displayFriend(friend) {
				
				var ulFriends = "";
				ulFriends = ulFriends + "<li>";
					ulFriends = ulFriends + "<a data-id='" + friend.id + "' data-name='" + friend.name + "'>";
						ulFriends = ulFriends + "<img src='https://graph.facebook.com/" + friend.id + "/picture'>";
						ulFriends = ulFriends + "<span>" + friend.name + "</span>";
					ulFriends = ulFriends + "</a>";
				ulFriends = ulFriends + "</li>";
				
				return ulFriends;
			}
			
			// function to display the first Ul of friends
			function displayInit(nbFriends, nbPages, friends) {
				var output = '';
				var ulFriends = "<ul class='fbFriends'>";
				for(var i=0, l= nbFriends ; i<l; i++){
 				    ulFriends = ulFriends + displayFriend(friends[i]);
				}
				ulFriends = ulFriends + "</ul>";
				output = output + ulFriends;
				// add the pagination if we have more friends
				if(opts.friendsByPage > 0 && opts.friendsByPage < friends.length) {
				    var pagination = "<nav class='pagination'><ul>";
				    	// create a link for each page of friends
				    	for (var i=0, l= nbPages ; i<l; i++){
				    		numPage = i+1;
				    		pagination = pagination + "<li><a ";
				    		if(numPage == 1) {
				    			pagination = pagination + "class='current'";
				    		}
				    		pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
				    	}
				    pagination = pagination + "</ul></nav>";
				    // add pagination to the output
				    output = output + pagination;
				}
				return output;
			}
			
			function searchStringInArray(stringArray, string) {
			    var tabReturn = new Array();
			    var i = 0;
			    for (var j=0; j<stringArray.length; j++) {
			        
			        regEx = new RegExp(string, "gi");
			        if (stringArray[j].match(regEx)) {
			        	tabReturn[i] = j;
			        	i = i + 1;
			        }
			    }
			    return tabReturn;
			}
			
    	});
  	}
  	
  	// default configuration
  	$.fn.fbfriendselector.defaults = { 
  		friendsByPage: 0,
  		displayThumbnail: true,
  		loadingText: 'Loading...',
  		searchEngine: true,
  		onSelect: function(data) {
  			var display = 'Id: ' + data.id + '\n\nName: ' + data.name;
			console.log(display);
  		}
  	}

})(jQuery);