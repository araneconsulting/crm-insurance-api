export class ActivityRelatesEmailDto extends Map<any, any> {
  readonly companyMilestoneReached: boolean;
  readonly employeeMilestoneReached: boolean;
  readonly locationMilestoneReached: boolean;
  readonly newTeamMember: boolean;
  readonly youHaveNewNotifications: boolean;
  readonly youAreSentADirectMessage: boolean;
}
