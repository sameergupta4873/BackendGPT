import React from "react";

const Navbar = () => {
  return (
    <div className="shadow bg-white z-10 min-h-[80px] w-100">
      <nav className="bg-white border-gray-200 p-4 antialiased">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center h-[68px]">
            {/* <img src="/GiggrLogo.svg" className="h-[48px] " alt="Giggr Logo" /> */}
            <img src="https://flowbite.s3.amazonaws.com/logo.svg" class="ml-10 h-10" alt="FlowBite Logo" />
          </div>
          <div className="flex items-center relative lg:order-2">
            <button
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">View notifications</span>
              <svg
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 14 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 cursor-pointer rounded-lg hover:text-gray-900 hover:bg-gray-100"
              >
                <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
              </svg>
            </button>
            <div
              className="absolute top-14 right-0 max-w-[5rem] min-w-max  overflow-hidden z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow-lg"
              id="notification-dropdown"
            >
              {/* <div className="flex items-center justify-between py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50">
                <div></div>
                Notifications
                <svg
                  fill="none"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setNotificationOpen(false)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div> */}
              <div>
                <div className="flex py-3 px-4 border-b hover:bg-gray-100">
                  <div className="flex-shrink-0">
                    {/* <img className="w-11 h-11 rounded-full" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png" alt="Bonnie Green avatar"/> */}
                    <div className="flex absolute justify-center items-center ml-6 -mt-5 w-5 h-5 rounded-full border border-white bg-primary-700">
                      <svg
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 18 18"
                        className="w-2 h-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M15.977.783A1 1 0 0 0 15 0H3a1 1 0 0 0-.977.783L.2 9h4.239a2.99 2.99 0 0 1 2.742 1.8 1.977 1.977 0 0 0 3.638 0A2.99 2.99 0 0 1 13.561 9H17.8L15.977.783ZM6 2h6a1 1 0 1 1 0 2H6a1 1 0 0 1 0-2Zm7 5H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Z" />
                        <path d="M1 18h16a1 1 0 0 0 1-1v-6h-4.439a.99.99 0 0 0-.908.6 3.978 3.978 0 0 1-7.306 0 .99.99 0 0 0-.908-.6H0v6a1 1 0 0 0 1 1Z" />
                      </svg>
                    </div>
                  </div>
                  {/* <div className="pl-3 w-full">
                    <div className="flex w-full justify-center pt-3">
                      <button
                        type="button"
                        onClick={() => guardianApprovalGrant("yes")}
                        className="text-white bg-gray-800 w-full hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => guardianApprovalGrant("no")}
                        className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                      >
                        Deny
                      </button>
                    </div>
                    <div className="text-xs font-medium text-primary-700">
                      a few moments ago
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center ml-10 mr-3 text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-4 focus:ring-gray-300"
              id="user-menu-button"
              aria-expanded="false"
              data-dropdown-toggle="dropdown"
            >
              <span className="sr-only">Open user menu</span>

              <img
                alt="user photo"
                className="w-10 h-10 rounded-full"
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              />
            </button>
            {/* <div className="flex flex-col mr-5">
              <p className="">{userData?.fullName}</p>
              <p className="text-xs">{userData?.uid}</p>
            </div> */}

            <button
            //   onClick={() => signOut()}
              type="button"
              data-dropdown-toggle="notification-dropdown"
              className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                width="25px"
                height="25px"
                stroke-width="0"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
