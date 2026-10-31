using System;
using API.Models;
using API.Utilities;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddMicrosoftIdentityWebApiAuthentication(configuration);

builder.Services.AddControllers();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" }));

var allowedOrigins = configuration.GetSection("CORS:allowed").Get<string[]>()
    ?? throw new InvalidOperationException("CORS:allowed is not configured.");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebApp", policy =>
        policy.AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithOrigins(allowedOrigins));
});

builder.Services.AddGraphComponent(configuration);
builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
}

app.UseCors("AllowWebApp");

Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AuthHub>("/auth");

app.Run();
