import { ActivityRelatesEmailDto } from './activity-relates-email.dto';

export class EmailSettings {
  readonly emailNotification: boolean;
  readonly sendCopyToPersonalEmail: boolean;
  readonly activityRelatesEmail: Partial<ActivityRelatesEmailDto>;
}
