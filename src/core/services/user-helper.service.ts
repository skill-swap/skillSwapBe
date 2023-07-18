import { Global, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from '../../user/model/user.model';
import { Model } from 'mongoose';
import { FindUserByEmailDto } from '../interfaces/dto/user-helper.dto';


@Injectable()
@Global()
export class UserHelperService {

  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UsersDocument>,
  ) {}

  public async findUserByEmail(requestBody: FindUserByEmailDto): Promise<User> {
    try {
      return await this.model
        .findOne({
          email: requestBody.email,
        })
        .exec();
    } catch (e) {
      throw new InternalServerErrorException(
        'Something went wrong. Details:' + e.message,
      );
    }
  }
}
