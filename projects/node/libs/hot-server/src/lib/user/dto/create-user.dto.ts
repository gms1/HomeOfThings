export class CreateUserDto {
  email: string;
  shortName: string;
  firstName?: string;
  lastName?: string;
  password: string;
}

export default CreateUserDto;
