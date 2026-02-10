# Tasks

- [x] Add a role `worker`
- [x] Refactor the Sidebar component to be common on both `UserDash` and `AdminDash`
- [ ] Add a super admin role
- **SuperAdmin Permissions**
- It could assign other admin users, workers.
- Have all the Permissions that a usual admin user would have.
- **Admin**
- both `admin` and `super-admin` can assign a worker `complaint`
- [ ] Add and improve the light theme with better colours
- [ ] Add a `notifications` table to allow sending messages/actions initiatio
  - it should have a receipient, sender, seen, acted etc
- [ ] Also add `actions`
  - This will have simialr use to `notifications` but wil be more durable and will have reference to the `complaint` id
  - This will also keep track of teh current progress
- [ ] A new state machine design for allotment and usage of Milestones
- [ ] Milestone based perks and prioritization.

## Worker Role

- Worker after completion uploads the picture for the resolution evaluation
- `admin` can then verify and mark the `complaint` and `action` as completion
- [x] Add a `under_review` attribute in `complaints`

## Reward Points

- After marks as completed the reward points are credited (`+10`)
- Tiers
- Bronze (200) - Basic prioritization
- Silver (500) - Priority helpline
- Gold (1000)
- Platinum (2500) - Certificate of Appreciation from DM (Eco Stewardship Certificate)
- Users with higher tier will be prioritized for complaint resolutioni
