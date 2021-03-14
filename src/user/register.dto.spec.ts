import { LocationType } from 'shared/enum/location-type.enum';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(new RegisterDto()).toBeDefined();
  });

  it('should equals', () => {

    const dto: RegisterDto = {
      username: 'liuver',
      password: 'password',
      firstName: 'Liuver',
      lastName: 'Duran',
      email: 'liuver@gmail.com',
      location: "MEXICO-I",
      position: "SELLER",
      baseSalary: 400,
    };

    expect(dto).toEqual(
      {
        username: 'liuver',
        password: 'password',
        firstName: 'Liuver',
        lastName: 'Duran',
        email: 'liuver@gmail.com',
        location: "MEXICO-I",
        position: 'SELLER',
        baseSalary: 400,
      }
    );

  });
});
