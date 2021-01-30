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
      email: 'liuver@gmail.com'
    };

    expect(dto).toEqual(
      {
        username: 'liuver',
        password: 'password',
        firstName: 'Liuver',
        lastName: 'Duran',
        email: 'liuver@gmail.com'
      }
    );

  });
});
