# Webflow - Custom Starter Kits Dropdown

## Background

There is a custom stater kits dropdown that was created to augment the [Starter Kits page](https://business.nj.gov/starter-kits) on the static portion of Business.NJ.gov. The dropdown is populated with a list of industries, similar to the industry selector provided in the "My Account" onboarding experience. Users can search for an industry by scrolling the list or type to search with the same synonym list provided in the onboarding industry dropdown.

Assuming a user is not already logged into My Account, when a user selects an industry and click the "Access My Starter Kit" CTA, they're redirected to the dashboard for the relevant industry using the industry query parameter. E.G. selecting the "Accounting" industry will redirect the user to `account.business.nj.gov/onboarding?industry=certified-public-accountant`. A user with an active session will just be redirected to their current dashboard. This is consistent behavior for the industry query parameter.

## Implementation

The custom dropdown code used on Webflow lives in this repository at `web/src/webflow/dropdown.html`. It is implemented on the static site by way of a custom code block in the Webflow editor. Making changes to the implementation must happen manually through the Webflow editor and then be deployed. The UX Design team is currently maintaining the Webflow deployment process. Coordinate with them to deploy changes to be sure your changes do not disrupt their workflow.

Webflow's custom code block component does have a character limit. The code as it exists in `dropdown.html` does exceed this. Removing the whitespace from the HTML in its current format keeps us within those bounds. Significant further changes may exceed the limit.

## How It Works

The dropdown is populated by the list of available industries in our application. This information is provided to Webflow through `industrySync.mjs`, executed as one of our regular sync jobs during "My Account" deployment. On the Starter Kits page, the industries are pulled from Webflow's CMS, included in the HTML, but not visibly displayed to the user. The script included in `dropdown.html` will look for those industries and associated metadata, and use that information to populate options.

## Future Development

If you find yourself needing to make updates, you will need to run this locally as Webflow does not allow you to view the output of a custom code block if it includes JavaScript (which ours does). You can simply open `dropdown.html` in a browser window. Because the dropdown is dynamically populated based on information from the Webflow CMS, it will be empty. There is some commented code which mimics the hidden content that Webflow will render. Uncommenting these lines will allow you to populate your dropdown.

Please keep `dropdown.html` up to date with any changes made in Webflow so that this file can be treated as a source of truth.
