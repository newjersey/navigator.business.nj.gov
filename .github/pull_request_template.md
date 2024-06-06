<!-- Please complete the following sections as necessary. -->

## Description

<!-- Summary of the changes, related issue, relevant motivation, and context -->

### Ticket

<!-- Link to ticket in pivotal. Append ticket_id to provided URL. -->

This pull request resolves [#00000000](https://www.pivotaltracker.com/story/show/00000000).

### Approach

<!-- Any changed dependencies, e.g. requires an install/update/migration, etc. -->

### Steps to Test

<!-- If this work affects a user's experience, provide steps to test these changes in-app. -->

### Notes

<!-- Additional information, key learnings, and future development considerations. -->

## Code author checklist

- [ ] I have rebased this branch from the latest main branch
- [ ] I have performed a self-review of my code
- [ ] I have created and/or updated relevant documentation (EX: [Engineering Reference/FAQ](https://docs.google.com/document/d/1X4iWSGmBZdHYZ0jGqkwTR3_yyyqI_TiiJptfc8pi9Po)), if necessary
- [ ] I have not used any relative imports
- [ ] I have checked for and removed instances of unused config from CMS
- [ ] I have pruned any instances of unused code
- [ ] I have not added any markdown to labels, titles and button text in config
- [ ] If I added/updated any values in `userData` (including `profileData`, `formationData` etc), then I added a new migration file
- [ ] If I added any new collections to the CMS config, then I updated the search tool and `cmsCollections.ts` (see [CMS Additions in Engineering Reference/FAQ](https://docs.google.com/document/d/1X4iWSGmBZdHYZ0jGqkwTR3_yyyqI_TiiJptfc8pi9Po/edit#heading=h.fu5jdsrcqxbh))
- [ ] I have updated relevant `.env` values in both `.env-template` and in Bitwarden
