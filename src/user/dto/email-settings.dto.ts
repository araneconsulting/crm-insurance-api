import { ActivityRelatesEmailDto } from './activity-relates-email.dto';

export class EmailSettingsDto extends Map<any, any> {
  readonly emailNotification: boolean;
  readonly sendCopyToPersonalEmail: boolean;
  readonly activityRelatesEmail: Partial<ActivityRelatesEmailDto>;
}
