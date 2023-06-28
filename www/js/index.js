document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    document.getElementById('deviceready').classList.add('ready');
    var frame = document.querySelector('iframe');
    var backButton = document.getElementById('back-button');
    var menuButton = document.getElementById('menu-button');
    window.addEventListener('message', function(e){
        //This event is fired from our system when the views are properly initialized for sending messages to our system
        if(e.data && e.data.action == 'xenqu_registered_for_messages')
        {
            setupEmbedded(frame);
        } 
        else if(e.data && e.data.action =='xenqu_update_back_button') 
        {
            if(e.data.hasBack) backButton.style.display = 'block';
            else backButton.style.display = 'none';
        }
        else if(e.data && e.data.action =='xenqu_update_menu_state') 
        {
            if(e.data.hasNavigation) menuButton.style.display = 'block';
            else menuButton.style.display = 'none';
        }
        else if(e.data && e.data.action == 'xenqu_system_action' && e.data.state)
        {
            //This is the state of xenqu telling us that the instance viewer has been closed (this only happend when the item doesn't need to reload and is expected to return the user to the record view)
            if(e.data.state == 'close_item_viewer')
            {
                frame.remove();
            }
        }
    });
    frame.onload = function() { 
        setupEmbedded(frame);        
    };
    backButton.addEventListener('click', function(){
        //Execute action has 2 current functionalities, trigger back and open dropdown menu with additional actions as seen below
        frame.contentWindow.postMessage({action: 'xenqu_execute_action', back: true}, frame.src);
    });
    menuButton.addEventListener('click', function(){
        frame.contentWindow.postMessage({action: 'xenqu_execute_action', menu: true}, frame.src);
    });
}
function setupEmbedded(frame){
    //This message must be sent once our system is ready to listen to messages in order to tell us the system is loaded externally to remove top navigation, branding, and to add corresponding styles
    frame.contentWindow.postMessage({action: 'set_embedded', embed: true}, frame.src);
    //This message asks the system to dispatch the event "xenqu_update_back_button" so we can hide or show the back button as necessary at the start of the application
    //Since messages are serialized, we cannot post a message with a callback therefore, this is used to request the event to be handled above
    frame.contentWindow.postMessage({action: 'xenqu_get_navigation_back_state'}, frame.src);
    //Same as above (in case of a reload or redirect to login)
    frame.contentWindow.postMessage({action: 'xenqu_get_navigation_menu_state'}, frame.src);

    //This tells xenqu we are loading into an instance of an item, this url is fetched from the admin link with user credentials
    frame.contentWindow.postMessage({action: 'xenqu_execute_action', load_item: true}, '*');
    
}